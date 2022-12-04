
/*

File: image-optimize.js

Description:

Used for optimizing images like converting them to webp format

Called during export site

*/


//### start of required external libraries

const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');

const fs = require('fs');

//### end of required external libraries


class imageOptimizer
{

  //Convert jpg,png files to webp format, usedin export site
  convertToWebP(imgpath,buildpath)
  {
  		return new Promise((resolve, reject) => {

				//use the greate imagemin library for conversion. Quality is set to 90
				//TODO: can be set later through a property in recipe.json
  				imagemin([imgpath], {
  				destination: buildpath,
  				plugins: [
  					imageminWebp({quality: 90})
  				]
  			}).then(function(res)
  		    {
  				fs.unlinkSync(imgpath);
  				resolve(true);

  			}).catch(function(err)
  		    {
  				console.log(err);
  				reject(err);
  			});

  		});
  }

};

module.exports = imageOptimizer
