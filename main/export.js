class exportSite
{

     export()
    {
      var prms = new Array();
      //Refresh output directory before export
        if (fs.existsSync("out")) {
          fs.rmSync("out", {recursive: true});

        }

         fs.mkdirSync("out");


          //copy all static files to output folder
          ncp('WebContent/STATIC', 'out/',
                  function (err) {
              if (err) {
                  console.error(err);
              process.exit();
              return;
              }

            var options = {

            };




            const imgtree = dirTree("out/images", { extensions: /\.(jpg|png)$/ });

            var farr = new Array();
            getFlatStructure(farr,imgtree.children);

            var prms2 = new Array();

            var webparr = new Array();

            for(var h=0; h < farr.length; h++)
            {
              var obj = farr[h];



              if(obj.path.includes(".png") || obj.path.includes(".jpg"))
              {
                console.log(obj.path)
                var npath = obj.path.replace(".png",".webp");
                npath = obj.path.replace(".jpg",".webp");

                var narr = npath.split("/");
                npath = npath.replace(narr[narr.length-1],"");

                var opath = obj.path.replace("out/","");
                webparr.push(opath);

                prms2.push(webpconvert(obj.path,npath));



              }

            }

            Promise.all(prms2).then(function(){

               const jstree = dirTree("out/js/internal", { extensions: /\.css/ });


                for(var h=0; h < jstree.children.length; h++)
                {
                  var obj = jstree.children[h];

                  fs.writeFileSync(obj.path, UglifyJS.minify({
                    "file.js": fs.readFileSync(obj.path, "utf8")
                  }, options).code, "utf8");


                  console.log("Minifying JS: "+obj.path);

                }

                const csstree = dirTree("out/css/internal", { extensions: /\.css/ });


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
                const domtree = dirTree("WebContent", { extensions: /\.ejs/ });

              for(var h=0; h < domtree.children.length; h++)
              {

                var obj = domtree.children[h];

                var hpath = obj.path.replace("WebContent/","")

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
                if(!DEFAULT_DIRS[hpathArr[0]])
                {

                  console.log("Compiling: " + hpath);

                  var obj = new Object();
                  obj.urlpath = remotesrv+"/";

                  var sval = "<url>\n";
                  sval = sval + "<loc>"+remotesrv+"/"+hpath+"</loc>\n";

                  var date = new Date().toISOString();
                  sval = sval + "<lastmod>"+date+"</lastmod>\n";
                  sval = sval + "</url>\n";

                  sitemap = sitemap + sval;


                  prms.push(renderPage(hpath,obj,htmlfile,webparr));
                }
              }

              sitemap = sitemap + '</urlset>';
              fs.writeFileSync("out/sitemap.xml", sitemap);

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
      for(var j=0;j<arr.length;j++)
      {
        var obj = new Object();
        obj.path = arr[j].path;
        obj.name = arr[j].name;

        flatarr.push(obj);

        if(arr[j].children)
        {
          getFlatStructure(flatarr,arr[j].children);
        }
      }
    }



};

module.exports = exportSite
