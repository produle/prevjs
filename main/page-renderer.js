
const dirTree = require("directory-tree");

const express = require('express');
const path = require('path');
var minify = require('html-minifier').minify;
var minifyHTML = require('express-minify-html');
var UglifyJS = require('uglify-js');
var cleanCSS = require('clean-css');
const fs = require('fs');

const fetch = require('node-fetch');

class pageRenderer
{
	
	fetchPageData(dataurl)
    {
	
      return new Promise((resolve, reject) => {
      
      		fetch(dataurl, { method: "Get" })
		    .then(res => res.json())
		    .then((json) => {
		       	
	
		 			
		 			resolve(json);
		 
	
		    }).
			  catch(error => {
			      reject(false);
			}); 
      
      });
      
     }
	

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


                 for(var n=0; n < webparr.length; n++)
                 {
                    var replace = webparr[n];

                    var destplace = replace.replace(".jpg",".webp");
                     destplace = replace.replace(".png",".webp");

                    var re = new RegExp(replace,"g");

                    html = html.replace(re,destplace)
                  }

              html = minify(html, {
                   removeComments:            true,
                      collapseWhitespace:        true,
                      collapseBooleanAttributes: true,
                      removeAttributeQuotes:     true,
                      removeEmptyAttributes:     true,
                   minifyJS:                  true
                });


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

	modifyHTML(html,path)
	{
		var str = "<script> var prevjs_localpathvar='"+path+"'; ";
		
		
		str = str +`
		
		 
			    let webSocket = new WebSocket("ws://localhost:7071");
			  
			
			    webSocket.onmessage = (event) => {
			     
					
					if(prevjs_localpathvar == event.data)
			     	location.reload();
			     	
			    };

		   </script> 
		
		
		`;
		
		
		var modHtml = insertTag(str, html);
		
		return modHtml;
		

	}

    previewPage (req,res)
    {
		var self = this;

		if(req.originalUrl.includes(".ico"))
		return;
		
        var surl = "" + req.originalUrl.slice(1);

      	try
      	{
      			var obj = new Object();
      			obj.urlpath = global.pconfig.local_url+"/";


      			 res.render(surl, {siteobj: obj}, function (err, html) {

      				  if (err) {
						//console.log(err);
						//check if it is a template path
						console.log("Checking if it is a template path...");
						
					 	const temptree = dirTree(global.pconfig.localpath+"TEMPLATES", { depth: 1 });
				
					  var pageobj = null;
						
					   for(var j=0;j<temptree.children.length;j++)
				       {
							
							if(fs.lstatSync(temptree.children[j].path).isDirectory())
							{
			        			var obj = new Object();
			        			obj.path = temptree.children[j].path;
			        			obj.name = temptree.children[j].name;

								var templatepath = obj.path;
								
								if (fs.existsSync(templatepath+"/template.json")) {
						    	
									var jsonString = fs.readFileSync(templatepath+"/template.json", "utf8");
								  
						
								  var tempObj = JSON.parse(jsonString);
						
									
								  if(tempObj.generate == true || tempObj.generate == "true")
						  		  {
									
										var temparr = templatepath.split("/");
										var tempname = temparr[temparr.length-1];
									
										for(var p=0;p<tempObj.pages.length;p++)
										{
											var page = tempObj.pages[p];
											
											
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
						
						if(pageobj)
						{
							
				 				var ejspath = "templates/"+pageobj.tempname+"/template.ejs";
              				 
              				 if(pageobj.page.source == "inline")
              				 {
								 obj.data = pageobj.page.data;	
							
								res.render(ejspath, {siteobj: obj}, function (err, html) {	
									if(err)
									{
										console.log("Error displaying " + obj.urlpath+""+surl);
      				    				res.status(500).send("Server error! Try again.");
									}	
									else
									res.send(self.modifyHTML(html,surl));						
								 
								});
							}
							
							if(pageobj.page.source == "jsonurl")
              				 {

								self.fetchPageData(pageobj.page.dataurl).then((pdata) => {
								    
								     obj.data = pdata;
											
									res.render(ejspath, {siteobj: obj}, function (err, html) {
										if(err)
										{
											console.log("Error displaying " + obj.urlpath+""+surl);
	      				    				res.status(500).send("Server error! Try again.");
										}	
										else
										res.send(self.modifyHTML(html,surl));								
								 
									});						
							
								});
								
								 

								}
						}
						else
						{
							
      						console.log("Error displaying " + obj.urlpath+""+surl);
      				    	res.status(500).send("Server error! Try again.");
						}
      				  }
      				  else {
	
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

String.prototype.htmlsplice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};

var insertTag = function(newTag, html) {
  var end = html.indexOf('</head>');
  return html.htmlsplice(end, 0, newTag);
}