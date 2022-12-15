

/*

File: export.js

Description:

Exports prevjs site to a static website in a local dir that is optimized based on variables set in recipe.json

*/


//### start of required external libraries

const dirTree = require("directory-tree");

var ncp = require('ncp').ncp;
var minify = require('html-minifier').minify;
var minifyHTML = require('express-minify-html');
var UglifyJS = require('uglify-js');
var cleanCSS = require('clean-css');

const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

//### end of required external libraries

//### start of required internal classes

const imageOptimizer = require('../main/image-optimize.js')
const imageOptimizerObj = new imageOptimizer();

const pageRenderer = require('../main/page-renderer.js')
const pageRendererObj = new pageRenderer();

const prevUtils = require('../main/utils.js')
const prevUtilsObj = new prevUtils();
//### end of required internal classes


//global sitemap variable used during export for forming sitemap.xml file
var sitemap = "";

class exportSite
{

	//Called for rendering contents of each template folder under TEMPLATES dir
    exportTemplate = async function(templatepath,webparr)	
    {
    	var self = this;
    	
		return new Promise((resolve, reject) => {
			
			 if (fs.existsSync(templatepath+path.sep+"template.json")) {
			    	fs.readFile(templatepath+path.sep+"template.json", "utf8", (err, jsonString) => {
					  if (err) {
					    console.log("File read failed: " + templatepath+path.sep+"template.json", err);
						resolve(false);
					    return;
					  }
			
					  var tempObj = JSON.parse(jsonString);
						
					  //generate the template only if its generate flag is set to true
					  if(tempObj.generate == true || tempObj.generate == "true")
			  		  {
							 var prms = new Array();
						
							var temparr = templatepath.split(path.sep);
							var tempname = temparr[temparr.length-1];
						
							//loop through all pages set inside template.json
							for(var p=0;p<tempObj.pages.length;p++)
							{
								var page = tempObj.pages[p];
								
								 var obj = new Object();
                  				 obj.urlpath = global.pconfig.production_url+"/";
                  				 
                  				 
								 var htmlfile = "index.html";
							
								 var ejspath = "templates"+path.sep+tempname+path.sep+"template.ejs";
															
								 console.log("Compiling template for: "+page.path );
							
								 //form sitemap.xml
				                  var sval = "<url>\n";
				                  sval = sval + "<loc>"+global.pconfig.production_url+"/"+page.path+"</loc>\n";
				
				                  var date = new Date().toISOString();
				                  sval = sval + "<lastmod>"+date+"</lastmod>\n";
				                  sval = sval + "</url>\n";

								 sitemap = sitemap + sval;
                  				 
								 //If inline data source, then just get the data and render the page
                  				 if(page.source == "inline")
                  				 {
									 obj.data = page.data;								
									 
	                 				 prms.push(pageRendererObj.renderPage(ejspath,page.path,obj,htmlfile,webparr));
								}
								
								//If remote data with json url. First fetch the data and then render the page
								if(page.source == "jsonurl")
                  				 {
										var npath = page.path;		
										
									var fobj = new Object();
									fobj.ejspath = ejspath;
									fobj.npath = npath;
									fobj.obj = obj;
									fobj.htmlfile = htmlfile;
									fobj.webparr = webparr;
										
								    //fetch the json from the url
									prms.push(prevUtilsObj.fetchPageData(page.dataurl,tempname,fobj).then((pdata) => {
									    
											pdata.obj.data = pdata.data;
		                 				 prms.push(pageRendererObj.renderPage(pdata.ejspath,pdata.npath,pdata.obj,pdata.htmlfile,pdata.webparr));
								
									}));
									
									 
    
								}
								
								
							}
							
							//On completetion of all the pages inside the template.json of this template
							 Promise.all(prms).then(function(){
								
								resolve(true);
							
							});
					  }
					  else
						resolve(false);
			
			
					});
			  }
			  else
			  {
				console.log("template.json file does not exist for " + templatepath);	
				resolve(false);
			 }
			
		
		});	
	};
	
	//Utility functio
	//main export function which is the call of entry
    export()
    {
		var self = this;
		
       var prms = new Array();

	     //Refresh output directory before export
        if (fs.existsSync(global.pconfig.exportdir)) {
          fs.rmSync(global.pconfig.exportdir, {recursive: true});

        }

         fs.mkdirSync(global.pconfig.exportdir);


          //copy all static files to output folder
          ncp(global.pconfig.localpath+'STATIC', global.pconfig.exportdir,
                  function (err) {
              if (err) {
                  console.error(err);
              process.exit();
              return;
              }

            var options = {

            };

			
			//Loop through images under images dir 
			var prms2 = new Array();

            var webparr = new Array();

			if(global.pconfig.optimize.webp == "false")
			{
				//stub
			}
			else
			{
	           
				var farr = new Array();
				prevUtilsObj.getAllFiles(global.pconfig.exportdir+"images",farr,[".jpg",".png"]);

	            //prevUtilsObj.getFlatStructure(farr,imgtree.children);
	
	            for(var h=0; h < farr.length; h++)
	            {
	              var obj = farr[h];
	
	              if(obj.includes(".png") || obj.includes(".jpg"))
	              {
	                var npath = obj.replace(".png",".webp");
	                npath = obj.replace(".jpg",".webp");
	
	                var narr = npath.split("/");
	                npath = npath.replace(narr[narr.length-1],"");
	
	                var opath = obj.replace(global.pconfig.exportdir,"");
	                webparr.push(opath);
	
					//convert images to webp if possible
	                prms2.push(imageOptimizerObj.convertToWebP(obj,npath));
	
	
	              }
	
	            }
			}

			//on completion all image optimizations
            Promise.all(prms2).then(function(){

				if(global.pconfig.optimize.minify_js == "false")
				{
					//stub
				}
				else
				{
				   //loop through all js files under STATIC folder
	
				   var jstree = new Array();
				   prevUtilsObj.getAllFiles(global.pconfig.exportdir+"js"+path.sep+"internal",jstree,[".js"]);

	                for(var h=0; h < jstree.length; h++)
	                {
	                  	var obj = jstree[h];

						if(obj.includes(".js"))
		                {
		
						  //minimize the js files one by one
		                  fs.writeFileSync(obj, UglifyJS.minify({
		                    "file.js": fs.readFileSync(obj, "utf8")
		                  }, options).code, "utf8");
		
		
		                  console.log("Minifying JS: "+obj);
						}
		
	                }
				}
				
				if(global.pconfig.optimize.minify_css == "false")
				{
					//stub
				}
				else
				{

					//loop through all css files under STATIC folder
	
					var csstree = new Array();
				   prevUtilsObj.getAllFiles(global.pconfig.exportdir+"css"+path.sep+"internal",csstree,[".css"]);
	
	
	                for(var h=0; h < csstree.length; h++)
	                {
	                    var obj = csstree[h];
						
						if(obj.includes(".css"))
		                {
							
		                    var cssf = fs.readFileSync(obj, "utf-8");
		
		                   for(var n=0; n < webparr.length; n++)
		                   {
		                      var replace = webparr[n];
		
							  //replace any existing image files to webp
		                      var destplace = replace.replace(".jpg",".webp");
		                       destplace = replace.replace(".png",".webp");
		
		                      var re = new RegExp(replace,"g");
		                      cssf = cssf.replace(re,destplace)
		                    }
		
						  //minify the css file
		                  var cssoutput = new cleanCSS({
		                    sourceMap: true
		                  }).minify(cssf);
		
		                  fs.writeFileSync(obj, cssoutput.styles);
		
		                  console.log("Minifying CSS: "+obj);
						}
	
	                }
				}

			  //start sitemap xml
              sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
              sitemap = sitemap + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';


              //get all paths with ejs files

				
				var domtree = new Array();
				prevUtilsObj.getAllFiles(global.pconfig.localpath,domtree,[".ejs",".md"]);

                
              for(var h=0; h < domtree.length; h++)
              {

                var obj = domtree[h];

                var hpath = obj.replace(global.pconfig.localpath,"")

                var hpathArr = hpath.split(path.sep);

                var ejsfile = hpathArr[hpathArr.length-1];

                var htmlfile = "index.html";

				var outpath = hpath;

                if(ejsfile.includes("ejs"))
                {
                  htmlfile = ejsfile.replace(".ejs",".html");
                  hpath = hpath.replace(ejsfile,"");
                }

                if(ejsfile.includes("md"))
                {
                  htmlfile = ejsfile.replace(".md",".html");
 					outpath = outpath.replace(ejsfile,"");
                }

				var exportpatharr = global.pconfig.exportdir.split(path.sep);
				var exportfolder = exportpatharr[exportpatharr.length-2];
				

                //filter out DEFAULT directories
                if(!global.DEFAULT_DIRS[hpathArr[0]] && hpath != exportfolder)
                {

                  console.log("Compiling: " + hpath);

                  var obj = new Object();
                  obj.urlpath = global.pconfig.production_url+"/";

                  var sval = "<url>\n";
                  sval = sval + "<loc>"+global.pconfig.production_url+"/"+hpath+"</loc>\n";

                  var date = new Date().toISOString();
                  sval = sval + "<lastmod>"+date+"</lastmod>\n";
                  sval = sval + "</url>\n";

                  sitemap = sitemap + sval;

				  //export each ejs file
				  if(ejsfile.includes("md"))
                  prms.push(pageRendererObj.renderMarkdown(hpath,outpath,obj,htmlfile,webparr));
				  else
                  prms.push(pageRendererObj.renderPage(hpath,hpath,obj,htmlfile,webparr));

                }
              }

			 //loop and render all templates inside TEMPLATES dir
			 const temptree = dirTree(global.pconfig.localpath+"TEMPLATES", { depth: 1 });
		
			
			   for(var j=0;j<temptree.children.length;j++)
		       {
					
					if(fs.lstatSync(temptree.children[j].path).isDirectory())
					{
	        			var obj = new Object();
	        			obj.path = temptree.children[j].path;
	        			obj.name = temptree.children[j].name;
	
						//export each template folder
						prms.push(self.exportTemplate(obj.path,webparr));
	
					}
	
	
				}

			  //final promise call after completing the above
              Promise.all(prms).then(function(){
	
					//write sitemap.xml at the end
              		sitemap = sitemap + '</urlset>';
              		fs.writeFileSync(global.pconfig.exportdir+"sitemap.xml", sitemap);

                  console.log("Exported to " + global.pconfig.exportdir);
                  process.exit();

               }).catch(function(err){
                      console.log(err);
                process.exit();


                  });
             }).catch(function(err){
                    console.log(err);
              process.exit();


                });
           
          });





    }
    


};

module.exports = exportSite
