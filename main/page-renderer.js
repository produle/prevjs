
const express = require('express');
const path = require('path');
var minify = require('html-minifier').minify;
var minifyHTML = require('express-minify-html');
var UglifyJS = require('uglify-js');
var cleanCSS = require('clean-css');
const fs = require('fs');

class pageRenderer
{

   renderPage(hpath,obj,htmlfile,webparr)
  {
	
      return new Promise((resolve, reject) => {
          //compile ejs file and save to out folder
		try
		{
          global.app.render(hpath, {siteobj: obj}, function (err, html) {

              if (err) {
              //console.log(hpath + "  " +err);
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


              var opath = global.pconfig.exportdir+hpath;

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


    previewPage (req,res)
    {
	
		console.log(req.originalUrl);

		if(req.originalUrl.includes(".ico"))
		return;
		
        var surl = "" + req.originalUrl.slice(1);


      	try
      	{
      			var obj = new Object();
      			obj.urlpath = global.pconfig.local_url+"/";

								global.app.use(express.static(global.pconfig.localpath+'STATIC'));


      			 res.render(surl, {siteobj: obj}, function (err, html) {

      				  if (err) {
      					console.log(err)
      				    res.status(500).send("Server error! Try again.");
      				  }
      				  else {
      				    res.send(html);
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
