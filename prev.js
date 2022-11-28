#!/usr/bin/env node
const { program } = require('commander');
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

const createSite = require('./main/create.js')
const createSiteObj = new createSite();

const awsManager = require('./deploy/awsManager.js')
const awsManagerObj = new awsManager();

//required default directories
var DEFAULT_DIRS = new Object();
DEFAULT_DIRS["DRAFTS"] = true;
DEFAULT_DIRS["STATIC"] = true;
DEFAULT_DIRS["PARTIALS"] = true;
DEFAULT_DIRS["TEMPLATES"] = true;

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

var argPresent = false;


function processRecipe(recipe)
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
			
			if(!global.pconfig.createdir)
			global.pconfig.createdir = recipe;			
			
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


if(process.argv.length == 4 && process.argv[2].trim() == "--run" && process.argv[3].includes("recipe.json"))
{
	argPresent = true;
	processRecipe(process.argv[3]);
	
	
	global.app.listen(global.pconfig.port, () => {
					
	    global.LOCAL_PREVIEW = true;
		global.pconfig.local_url = "http://localhost:"+global.pconfig.port;
		console.log("Local preview server running on URL: "+global.pconfig.local_url);

	});
	
}	


if(process.argv.length == 4 && process.argv[2].trim() == "--export" && process.argv[3].includes("recipe.json"))
{
	argPresent = true;
	console.log("Exporting site");
	processRecipe(process.argv[3]);
	
	exportSiteObj.export();

	
	
}	


if(process.argv.length == 4 && process.argv[2].trim() == "--create")
{
	argPresent = true;
	console.log("Creating site");
	global.pconfig = new Object();
	global.pconfig.createdir = process.argv[3];
	
	createSiteObj.createBasic();

	
	
}	

if(process.argv.length == 4 && process.argv[2].trim() == "--deploy" && process.argv[3].includes("recipe.json"))
{
	argPresent = true;
	console.log("Deploying site");
	
	processRecipe(process.argv[3]);
	
	if(global.pconfig.deploy && global.pconfig.deploy.type == "aws")
	{
		if (!fs.existsSync(global.pconfig.exportdir)) 
		{
			console.log("Output folder does not exist at " + global.pconfig.exportdir +" .Export site first before deploying.");
			process.exit();
    	}

		awsManagerObj.deploy();
	}
	else
	{
		console.log("Deploy properties not found in recipe.json. Refer documentation.");
		process.exit();
       
	}
	
	
}	



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


program
  .name('prevjs')
  .description('Static website builder')
  .version('0.1.2')
  .option('--create <path-to-create-new-site>','Enter local path for creating a new prevjs site')
  .option('--run <path-to-recipe.json>','To preview webite in local server')
  .option('--export <path-to-recipe.json>','To export website')
  .option('--deploy <path-to-recipe.json>','To deploy exported website');

program.parse();

const options = program.opts();

if (process.argv.length < 4) 
{
  program.help();
}
else
{
	if(!argPresent)
	{
		 program.help();
	}
}



