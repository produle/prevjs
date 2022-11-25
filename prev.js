const express = require('express');
const path = require('path');
const { exec } = require("child_process");
const execFile = require('child_process').execFile;
const execSync = require('child_process').execSync;
const process = require('process');
const {resolve} = require('path');
const fs = require('fs');


var minify = require('html-minifier').minify;
var minifyHTML = require('express-minify-html');


//required variables


//required classes
const pageRenderer = require('./main/page-renderer.js')
const pageRendererObj = new pageRenderer();

const exportSite = require('./main/export.js')
const exportSiteObj = new exportSite();

const awsManager = require('./deploy/awsManager.js')
const awsManagerObj = new awsManager();

//required default directories
var DEFAULT_DIRS = new Object();
DEFAULT_DIRS["DRAFTS"] = true;
DEFAULT_DIRS["STATIC"] = true;
DEFAULT_DIRS["PARTIALS"] = true;

global.DEFAULT_DIRS = DEFAULT_DIRS;

global.DEBUG = true;
global.LOCAL_PREVIEW = false;

global.pconfig = new Object();

//required global variables
global.app = express();


//minification configuration
global.app.use(minifyHTML({
    override:      true,
    exception_url: false,
    htmlMinifier: {
        removeComments:            true,
        collapseWhitespace:        true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes:     true,
        removeEmptyAttributes:     true,
        minifyJS:                  true
    }
}));

//Set the view engine to ejs
global.app.set('view engine', 'ejs');


//parse request body as JSON post request
global.app.use(express.json());

//for read the urlencode data
global.app.use(express.urlencoded({
    extended: true
}))



class prevjs
{
 	processRecipe(recipe)
	{
		try {
			
		recipe = recipe.trim();
		let configdata = fs.readFileSync(recipe);
		
			if(configdata)
			{
				global.pconfig = JSON.parse(configdata);
				
				if(!global.pconfig.port)
				global.pconfig.port = 3000;
				
				global.pconfig.localpath = recipe.replace("recipe.json","");
				
				if(!global.pconfig.production_url)
				global.pconfig.production_url = "http://localhost:"+global.pconfig.port;
				
				if(!global.pconfig.exportdir)
				global.pconfig.exportdir = global.pconfig.localpath+"out/";
				
				global.app.use(express.static(global.pconfig.localpath+'STATIC'));
						
				//Set the view folder
				global.app.set('views', global.pconfig.localpath);
			}
			else
			{
				console.log("Error");
			}
		}
		catch(e)
		{
			if(global.DEBUG)
			console.log(e)
			
			console.log("Check path of recipe.json file. Example /Users/myname/website/recipe.json");
			process.exit();
	       
		}
		
	}
	
	
	viewSite(recipePath)
	{
		
		this.processRecipe(recipePath);
		
		
		global.app.listen(global.pconfig.port, () => {
						
		    global.LOCAL_PREVIEW = true;
			global.pconfig.local_url = "http://localhost:"+global.pconfig.port;
			console.log("Local preview server running on URL: "+global.pconfig.local_url);
	
		});
		
	}	
 

}

module.exports = prevjs;

//Declare routes

//Preview
global.app.get('/*', (req, res) => {

	
	 if(global.LOCAL_PREVIEW)
	 pageRendererObj.previewPage(req,res);

});




//Error handling to prevent app from crashing
process.on('uncaughtException', (error, origin) => {
  console.log('----- Uncaught exception -----')
  console.log(error)
  console.log('----- Exception origin -----')
  console.log(origin)
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('----- Unhandled Rejection at -----')
  console.log(promise)
  console.log('----- Reason -----')
  console.log(reason)
});
