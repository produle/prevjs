

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
			
			 if (fs.existsSync(templatepath+"/template.json")) {
			    	fs.readFile(templatepath+"/template.json", "utf8", (err, jsonString) => {
					  if (err) {
					    console.log("File read failed: " + templatepath+"/template.json", err);
						resolve(false);
					    return;
					  }
			
					  var tempObj = JSON.parse(jsonString);
						
					  //generate the template only if its generate flag is set to true
					  if(tempObj.generate == true || tempObj.generate == "true")
			  		  {
							 var prms = new Array();
						
							var temparr = templatepath.split("/");
							var tempname = temparr[temparr.length-1];
						
							//loop through all pages set inside template.json
							for(var p=0;p<tempObj.pages.length;p++)
							{
								var page = tempObj.pages[p];
								
								 var obj = new Object();
                  				 obj.urlpath = global.pconfig.production_url+"/";
                  				 
                  				 
								 var htmlfile = "index.html";
							
								 var ejspath = "templates/"+tempname+"/template.ejs";
															
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
								    //fetch the json from the url
									prms.push(prevUtilsObj.fetchPageData(page.dataurl).then((pdata) => {
									    
									     obj.data = pdata;
																		
		                 				 prms.push(pageRendererObj.renderPage(ejspath,page.path,obj,htmlfile,webparr));
								
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
            const imgtree = dirTree(global.pconfig.exportdir+"images", { extensions: /\.(jpg|png)$/ });

            var farr = new Array();
            prevUtilsObj.getFlatStructure(farr,imgtree.children);

            var prms2 = new Array();

            var webparr = new Array();

            for(var h=0; h < farr.length; h++)
            {
              var obj = farr[h];

              if(obj.path.includes(".png") || obj.path.includes(".jpg"))
              {
                var npath = obj.path.replace(".png",".webp");
                npath = obj.path.replace(".jpg",".webp");

                var narr = npath.split("/");
                npath = npath.replace(narr[narr.length-1],"");

                var opath = obj.path.replace(global.pconfig.exportdir,"");
                webparr.push(opath);

				//convert images to webp if possible
                prms2.push(imageOptimizerObj.convertToWebP(obj.path,npath));


              }

            }

			//on completion all image optimizations
            Promise.all(prms2).then(function(){

			   //loop through all js files under STATIC folder
               const jstree = dirTree(global.pconfig.exportdir+"js/internal", { extensions: /\.js/ });

                for(var h=0; h < jstree.children.length; h++)
                {
                  var obj = jstree.children[h];

				  //minimize the js files one by one
                  fs.writeFileSync(obj.path, UglifyJS.minify({
                    "file.js": fs.readFileSync(obj.path, "utf8")
                  }, options).code, "utf8");


                  console.log("Minifying JS: "+obj.path);

                }

				//loop through all css files under STATIC folder
                const csstree = dirTree(global.pconfig.exportdir+"css/internal", { extensions: /\.css/ });


                for(var h=0; h < csstree.children.length; h++)
                {
                    var obj = csstree.children[h];

                    var cssf = fs.readFileSync(obj.path, "utf-8");

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

                  fs.writeFileSync(obj.path, cssoutput.styles);

                  console.log("Minifying CSS: "+obj.path);


                }


			  //start sitemap xml
              sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
              sitemap = sitemap + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';


              //get all paths with ejs files
                
			  const domtree = dirTree(global.pconfig.localpath, { extensions: /\.ejs/ });

              for(var h=0; h < domtree.children.length; h++)
              {

                var obj = domtree.children[h];

                var hpath = obj.path.replace(global.pconfig.localpath,"")

                var hpathArr = hpath.split("/");

                var ejsfile = hpathArr[hpathArr.length-1];

                var htmlfile = "index.html";

                if(ejsfile.includes("ejs"))
                {
                  htmlfile = ejsfile.replace(".ejs",".html");
                  hpath = hpath.replace(ejsfile,"");
                }
                else
                {
                  ejsfile = "index.ejs";
                }

				var exportpatharr = global.pconfig.exportdir.split("/");
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
