

const fs = require('fs-extra');


class createSite
{

    createBasic()
    {
		var self = this;
		
       var prms = new Array();
      //Refresh output directory before export
		var dirarr = global.pconfig.createdir.split("/");
		dirarr[0]

        if (!fs.existsSync(global.pconfig.createdir)) {
         
			fs.mkdirSync(global.pconfig.createdir);

        }

		fs.mkdirSync(global.pconfig.createdir+"/prevjs-site");
		
		var fpath = global.pconfig.createdir+"/prevjs-site";
		
		if (!fs.existsSync(global.pconfig.createdir)) {
         
			console.log("Error! Path does not exist. Try again");
			process.exit();

        }

		fs.copySync("recipes/basic", fpath, { overwrite: true });
		
 		console.log("Created at "+fpath);
		console.log("To preview in browser type prevjs --run "+fpath+"/recipe.json");
        process.exit();


    }


};

module.exports = createSite
