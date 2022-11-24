

const dirTree = require("directory-tree");

var ncp = require('ncp').ncp;
var minify = require('html-minifier').minify;
var minifyHTML = require('express-minify-html');
var UglifyJS = require('uglify-js');
var cleanCSS = require('clean-css');
const fs = require('fs');

const imageOptimizer = require('../main/image-optimize.js')
const imageOptimizerObj = new imageOptimizer();


const pageRenderer = require('../main/page-renderer.js')
const pageRendererObj = new pageRenderer();

class exportSite
{

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

            const imgtree = dirTree(global.pconfig.exportdir+"images", { extensions: /\.(jpg|png)$/ });

            var farr = new Array();
            self.getFlatStructure(farr,imgtree.children);

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

                prms2.push(imageOptimizerObj.webpconvert(obj.path,npath));


              }

            }

            Promise.all(prms2).then(function(){

               const jstree = dirTree(global.pconfig.exportdir+"js/internal", { extensions: /\.css/ });


                for(var h=0; h < jstree.children.length; h++)
                {
                  var obj = jstree.children[h];

                  fs.writeFileSync(obj.path, UglifyJS.minify({
                    "file.js": fs.readFileSync(obj.path, "utf8")
                  }, options).code, "utf8");


                  console.log("Minifying JS: "+obj.path);

                }

                const csstree = dirTree(global.pconfig.exportdir+"css/internal", { extensions: /\.css/ });


                for(var h=0; h < csstree.children.length; h++)
                {
                  var obj = csstree.children[h];

                    var cssf = fs.readFileSync(obj.path, "utf-8");

                   for(var n=0; n < webparr.length; n++)
                   {
                      var replace = webparr[n];

                      var destplace = replace.replace(".jpg",".webp");
                       destplace = replace.replace(".png",".webp");

                      var re = new RegExp(replace,"g");
                      cssf = cssf.replace(re,destplace)
                    }

                  var cssoutput = new cleanCSS({
                    sourceMap: true
                  }).minify(cssf);

                  fs.writeFileSync(obj.path, cssoutput.styles);

                  console.log("Minifying CSS: "+obj.path);


                }



              var sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
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


                //filter out DEFAULT directories
                if(!global.DEFAULT_DIRS[hpathArr[0]])
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


                  prms.push(pageRendererObj.renderPage(hpath,obj,htmlfile,webparr));
                }
              }

              sitemap = sitemap + '</urlset>';
              fs.writeFileSync(global.pconfig.exportdir+"sitemap.xml", sitemap);

              Promise.all(prms).then(function(){

                  console.log("Exported");
                process.exit();

               }).catch(function(err){
                      console.log(err);
                process.exit();


                  });
             }).catch(function(err){
                    console.log(err);
              process.exit();


                });
            //process.exit();
          });





    }
    
	 getFlatStructure(flatarr,arr)
    {
		var self = this;
      for(var j=0;j<arr.length;j++)
      {
        var obj = new Object();
        obj.path = arr[j].path;
        obj.name = arr[j].name;

        flatarr.push(obj);

        if(arr[j].children)
        {
          self.getFlatStructure(flatarr,arr[j].children);
        }
      }
    }



};

module.exports = exportSite
