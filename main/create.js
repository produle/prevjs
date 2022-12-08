

/*

File: create.js

Description:

To create new prevjs based sites for the user. Gives a boilerplate for the user to work with.

*/


//### start of required external libraries

const path = require('path');
const fs = require('fs-extra');

//### end of required external libraries

class createSite
{

	//Copy from local prevjs recipe store to destination directory given by user
    createLocal(type)
    {
		var self = this;
		
		//srcDataDir contains path to recipe in local recipe store
		var srcDataDir = path.join(__dirname, "../recipes/"+type);
		
		if (fs.existsSync(srcDataDir)) 
		{
						
			//createdir contains destination dir
	        if (!fs.existsSync(global.pconfig.createdir)) 
			{         
				fs.mkdirSync(global.pconfig.createdir);
	        }
	
	
			global.pconfig.createdir = global.pconfig.createdir.replace(/\/$/, '');
	
			fs.mkdirSync(global.pconfig.createdir+path.sep+"prevjs-site");
			
			var fpath = global.pconfig.createdir+path.sep+"prevjs-site";
			
			if (!fs.existsSync(global.pconfig.createdir)) {
	         
				console.log("Error! Path does not exist. Try again");
				process.exit();
	
	        }

		
	
			fs.copySync(srcDataDir, fpath, { overwrite: true });
			
	 		console.log("Created at "+fpath);
			console.log("To preview in browser type prevjs --run "+fpath+"/recipe.json");
	        process.exit();
	   }
	   else
	   {
		
			console.log("Recipe does not exist - " + type);
			process.exit();
		}
	


    }


};

module.exports = createSite
