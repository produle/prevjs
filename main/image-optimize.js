
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');

const fs = require('fs');

class imageOptimizer
{

   webpconvert(imgpath,buildpath)
  {
  		return new Promise((resolve, reject) => {

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
