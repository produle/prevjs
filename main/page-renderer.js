
/*

File: page-renderer.js

Description:

Used for exporting ejs file to html file

Used for previewing ejs file in browser

*/

//### start of required external libraries

const dirTree = require("directory-tree");

const express = require('express');
const path = require('path');
var minify = require('html-minifier').minify;
var minifyHTML = require('express-minify-html');
var UglifyJS = require('uglify-js');
var cleanCSS = require('clean-css');
const fs = require('fs');


//### end of required external libraries



//### start of required internal classes
const prevUtils = require('../main/utils.js')
const prevUtilsObj = new prevUtils();
//### end of required internal classes


class pageRenderer
{
	
	

  //Convert from ejs to html format - used for site export
  renderPage(ejspath,outpath,obj,htmlfile,webparr)
  {
	
      return new Promise((resolve, reject) => {
          //compile ejs file and save to out folder
		try
		{
          global.app.render(ejspath, {siteobj: obj}, function (err, html) {

              if (err) {
              //console.log(outpath + "  " +err);
			 console.log("Error rendering " + outpath);
              resolve(true);
              }
              else {

				 //replace image paths with webp when applicable
                 for(var n=0; n < webparr.length; n++)
                 {
                    var replace = webparr[n];

                    var destplace = replace.replace(".jpg",".webp");
                     destplace = replace.replace(".png",".webp");

                    var re = new RegExp(replace,"g");

                    html = html.replace(re,destplace)
                  }

			  //minify html before export
			 if(global.pconfig.optimize.minify_html == "false")
			 {
				//stub
			 }
			 else
			 {
	              html = minify(html, {
	                   removeComments:            true,
	                      collapseWhitespace:        true,
	                      collapseBooleanAttributes: true,
	                      removeAttributeQuotes:     true,
	                      removeEmptyAttributes:     true,
	                   minifyJS:                  true
	                });
			  }

			  //write final html file to export directory set by user
              var opath = global.pconfig.exportdir+outpath;

              fs.mkdirSync(opath, { recursive: true });

              if(opath != "")
              {
                opath = opath + "/";
              }

               fs.writeFileSync(opath+htmlfile, html);

               resolve(true);

              }
            });

		}
		catch(e)
		{
			reject(false);
		}

      });
    }

	//Parse and inject js into html files before rendering or export
	modifyHTML(html,path)
	{
		//insert socket code, used in local preview and not export
		//This helps in auto-reloading page in browser whenever local changes happen
		//It communicates with preview server via sockets
		
		var wsstr = "<script> var prevjs_localpathvar='"+path+"'; ";		
		
		wsstr = wsstr +`
		
		 
			    let webSocket = new WebSocket("ws://localhost:7071");
			  
			
			    webSocket.onmessage = (event) => {
			     
					//TODO need more precise rendering
					//if(prevjs_localpathvar == event.data)
			     	location.reload();
			     	
			    };

		   </script> 
		
		
		`;
		
		
		wsstr = minify(wsstr, {
	                   removeComments:            true,
	                      collapseWhitespace:        true,
	                      collapseBooleanAttributes: true,
	                      removeAttributeQuotes:     true,
	                      removeEmptyAttributes:     true,
	                   minifyJS:                  true
	                });
		
		var modHtml = prevUtilsObj.insertTag(wsstr, html);
		
		return modHtml;
		

	}

	//preview page or site in localhost
    previewPage (req,res)
    {
		var self = this;

		//TODO: this code needs to be modified as browser defaults to this location for favicons
		if(req.originalUrl.includes(".ico"))
		return;
		
        var surl = "" + req.originalUrl.slice(1);

      	try
      	{
      			var obj = new Object();
      			obj.urlpath = global.pconfig.local_url+"/";

				//expressjs response render in server
      			 res.render(surl, {siteobj: obj}, function (err, html) {

      				  if (err) {
		
						//Store main error of ejs, do not throw until dynamic template check is complete
						//as it can be a path to a dynamic template
						
						var mainErr = err
						//console.log(err);
						
						
						//check if it is a dynamic template path under TEMPLATES dir
						console.log("Checking if it is a template path...");
						
					  	const temptree = dirTree(global.pconfig.localpath+"TEMPLATES", { depth: 1 });
				
					  	var pageobj = null;
						
						//This code is taken and modified from export class
					  	for(var j=0;j<temptree.children.length;j++)
				       	{
							//check each path in all template dirs
							if(fs.lstatSync(temptree.children[j].path).isDirectory())
							{
			        			var obj = new Object();
			        			obj.path = temptree.children[j].path;
			        			obj.name = temptree.children[j].name;

								var templatepath = obj.path;
								
								if (fs.existsSync(templatepath+"/template.json")) {
						    	
									
								  var jsonString = fs.readFileSync(templatepath+"/template.json", "utf8");
								  
						
								  var tempObj = JSON.parse(jsonString);
						
								  //Continue only if generate flag is true
								  if(tempObj.generate == true || tempObj.generate == "true")
						  		  {
									
										var temparr = templatepath.split("/");
										var tempname = temparr[temparr.length-1];
									
										for(var p=0;p<tempObj.pages.length;p++)
										{
											var page = tempObj.pages[p];
											
											//if dynamic path matches path requested by user
											if(page.path == surl)
											{
												
			                  				 	pageobj = new Object();
												pageobj.temparr = temparr;
												pageobj.tempname = tempname;
												pageobj.page = page;

											    break;
											
											}
											
											
										}
										
										
								  }
						
						
								}
			
			
							}

						}
						
						//Path matched with dynamic template
						if(pageobj)
						{
							
				 			 var ejspath = "templates/"+pageobj.tempname+"/template.ejs";
              				 
							 //render page if data source is inline
              				 if(pageobj.page.source == "inline")
              				 {
								 obj.data = pageobj.page.data;	
							
								res.render(ejspath, {siteobj: obj}, function (err, html) {	
									if(err)
									{
										console.log("### START OF RENDER ERROR");
										console.log(err);
										console.log("### END OF RENDER ERROR");
										console.log("Error displaying " + obj.urlpath+""+surl);
      				    				res.status(500).send("Server error! Try again.");
									}	
									else
									{
										console.log("...template: "+ surl);
										res.send(self.modifyHTML(html,surl));
									}						
								 
								});
							}
							
							//render page if data source is remote json url
							if(pageobj.page.source == "jsonurl")
              				 {

								prevUtilsObj.fetchPageData(pageobj.page.dataurl).then((pdata) => {
								    
								     obj.data = pdata;
											
									res.render(ejspath, {siteobj: obj}, function (err, html) {
										if(err)
										{
											console.log("### START OF RENDER ERROR");
											console.log(err);
											console.log("### END OF RENDER ERROR");
											console.log("Error displaying " + obj.urlpath+""+surl);
	      				    				res.status(500).send("Server error! Try again.");
										}	
										else
										{
											console.log("...template: "+ surl);
											res.send(self.modifyHTML(html,surl));
										}							
								 
									});						
							
								});
								
								 

								}
						}
						else
						{
							//throw main error if none of template paths matched
							console.log("### START OF RENDER ERROR");
							console.log(mainErr);
							console.log("### END OF RENDER ERROR");
							
      						console.log("Error displaying " + obj.urlpath+""+surl);
      				    	res.status(500).send("Server error! Try again.");
						}
      				  }
      				  else 
					  {
							//render if direct path is available
      				    	res.send(self.modifyHTML(html,surl));
      				  }
      			});

      	}
      	catch(e)
      	{
      		console.log(e);
      		res.send("Error displaying page!");
      	}
    }

};

module.exports = pageRenderer

