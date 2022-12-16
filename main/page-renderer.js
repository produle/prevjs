
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
var md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true,
  xhtmlOut: true,
  breaks: true
});


//### end of required external libraries



//### start of required internal classes
const prevUtils = require('../main/utils.js')
const prevUtilsObj = new prevUtils();
//### end of required internal classes


class pageRenderer
{
  replaceImagePath(html,webparr)
  {
	 //replace image paths with webp when applicable
     for(var n=0; n < webparr.length; n++)
     {
        var replace = webparr[n];

        var destplace = replace.replace(".jpg",".webp");
         destplace = replace.replace(".png",".webp");

        var re = new RegExp(replace,"g");

        html = html.replace(re,destplace)
      }

	 return html;
  }
	
  //Convert from md to html format - used for site export
  renderMarkdown(mdpath,outpath,obj,htmlfile,webparr)
  {
		var self = this;
	
      return new Promise((resolve, reject) => {
          //compile ejs file and save to out folder
		try
		{
				
          		var mdString = fs.readFileSync(global.pconfig.localpath+""+mdpath, "utf8");

															
				var mdTitle = global.pconfig.name + " - ";
				
				mdpath = mdpath.replace("index.md","");
				mdpath = mdpath.replace(".md","");
				
				if(mdpath.trim() == "")
				{
					mdTitle = "Homepage";
				}
				else
				{
					mdTitle = mdpath;
				}

				var html = "";
				
				
							
				var patharr = mdpath.split(path.sep);
				
				var level = self.getLevel(patharr);
				
				html = md.render(mdString);
				html = self.getFullMarkDownHTML(html,mdTitle,level);

				html = self.replaceImagePath(html,webparr);

			 html = self.modifyHTML(html,null);

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
                opath = opath + path.sep;
              }

               fs.writeFileSync(opath+htmlfile, html);

               resolve(true);

              
            

		}
		catch(e)
		{
			reject(false);
		}

      });
    }
	

  //Convert from ejs to html format - used for site export
  renderPage(ejspath,outpath,obj,htmlfile,webparr)
  {
	
	var self = this;
	
      return new Promise((resolve, reject) => {
          //compile ejs file and save to out folder
		try
		{
          global.app.render(ejspath, {siteobj: obj}, function (err, html) {

              if (err) {
              console.log(outpath + "  " +err);
			 console.log("Error rendering " + ejspath);
              resolve(true);
              }
              else {

				 html = self.replaceImagePath(html,webparr);

			  html = self.modifyHTML(html,null);
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
                opath = opath + path.sep;
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
		
		var wsstr = "";
		
		if(global.LOCAL_PREVIEW)
		{
		   wsstr = "<script> var prevjs_localpathvar='"+path+"'; ";		
			
			wsstr = wsstr +`
			
			 
				    let webSocket = new WebSocket("ws://localhost:7071");
				  
				
				    webSocket.onmessage = (event) => {
				     
						//TODO need more precise rendering
						//if(prevjs_localpathvar == event.data)
				     	location.reload(true);
				     	
				    };
	
			   </script> 
			
			
			`;
			
			
			
		}
		
		if(global.pconfig.optimize.prefetch_pages == "true")
		{
			wsstr = wsstr + '<script type="text/javascript" src="https://unpkg.com/quicklink@2.3.0/dist/quicklink.umd.js"></script>	';
			
			wsstr = wsstr + "<script>  ";		
			
			wsstr = wsstr +`
			
			 
				    window.addEventListener("load",()=>{quicklink.listen()});
	
			   </script> 
			
			
			`;			
		}
		
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
	
	getLevel (patharr)
    {
		var level = "./"
							
		if(patharr.length > 1)
		{				
			level = "";
						
			for(var j=0; j < patharr.length; j++)
			{
				level = level + "../";
			}
		}
		
		return level;
	}
	
	getFullMarkDownHTML (mdhtml,title,level)
    {
		var str = `<!DOCTYPE html>
				<html lang="en">
				    <head>
				<meta charset=utf-8>
				`;
				
		
		str = str + "<title>"+title+"</title>";
							
						
		if(global.pconfig.markdown && global.pconfig.markdown.style)
		{
			if(global.pconfig.markdown.style.trim() != '')
			{
				str = str + '<link rel="stylesheet" type="text/css" href="'+level+global.pconfig.markdown.style+'" />'
			}
		}				    
			
			
		if(global.pconfig.markdown && global.pconfig.markdown.script)
		{
			if(global.pconfig.markdown.script.trim() != '')
			{
				str = str + '<script type="text/javascript" src="'+level+global.pconfig.markdown.script+'"></script>'
			}
		}				  
				
		str = str + "	   </head><body>";
		str = str + mdhtml;
		str = str + "</body></html>";
		
		return str;
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
				res.set('Cache-control', `no-store`);

      			 res.render(surl, {siteobj: obj}, function (err, html) {
	

      				  if (err) {
	
						try
						{
							//check if it is markdown
							var mdpath = global.pconfig.localpath+""+surl;
							
							
							var patharr = surl.split("/");
							
							var level = self.getLevel(patharr);
							
							if (!fs.existsSync(mdpath+".md")) 
							{					
								if(!mdpath.includes(".md"))
								{
									mdpath = prevUtilsObj.removeTrailingSlash(mdpath);
									mdpath = mdpath + "/";
								}
								
								var sarr = mdpath.split("/");
														
								if(sarr[sarr.length-1] == "")
								mdpath = mdpath + "index.md";
							}
							else
								mdpath = mdpath + ".md";
							
							
							var mdFile = false;		
							
							if (fs.existsSync(mdpath)) 
							{
								mdFile = true;
								
								var mdString = fs.readFileSync(mdpath, "utf8");
															
								var mdTitle = global.pconfig.name + " - ";
								
								if(surl.trim() == "")
								{
									mdTitle = "Homepage";
								}
								else
								{
									mdTitle = surl;
								}
	
								html = md.render(mdString);
								html = self.getFullMarkDownHTML(html,mdTitle,level);
								
								res.send(self.modifyHTML(html,surl));
								
								return;
		
							}
						}
						catch(e)
						{
							console.log(e);
						}
		
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
								
								if (fs.existsSync(templatepath+path.sep+"template.json")) {
						    	
									
								  var jsonString = fs.readFileSync(templatepath+path.sep+"template.json", "utf8");
								  
						
								  var tempObj = JSON.parse(jsonString);
						
								  //Continue only if generate flag is true
								  if(tempObj.generate == true || tempObj.generate == "true")
						  		  {
									
										var temparr = templatepath.split(path.sep);
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
							 obj.urlpath = global.pconfig.local_url+"/";

				 			 var ejspath = "TEMPLATES"+path.sep+pageobj.tempname+path.sep+"template.ejs";
              				 
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
								var fobj = new Object();
								fobj.obj = obj;
								fobj.surl = surl;
								
								prevUtilsObj.fetchPageData(pageobj.page.dataurl,pageobj.tempname,fobj).then((pdata) => {
								    
								     fobj.obj.data = pdata.data;
											
									res.render(ejspath, {siteobj: obj}, function (err, html) {
										if(err)
										{
											console.log("### START OF RENDER ERROR");
											console.log(err);
											console.log("### END OF RENDER ERROR");
											console.log("Error displaying " + fobj.obj.urlpath+""+fobj.surl);
	      				    				res.status(500).send("Server error! Try again.");
										}	
										else
										{
											console.log("...template: "+ fobj.surl);
											res.send(self.modifyHTML(html,fobj.surl));
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

