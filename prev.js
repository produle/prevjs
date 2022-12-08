#!/usr/bin/env node

/*

File: prev.js

Description:

Main entry point of prevjs command line tool
It processes recipe.json and calls other classes to peform operations
It also starts expressjs server to preview site

*/

//### start of required external libraries

const { program } = require('commander');
const express = require('express');
const path = require('path');
const { Table } = require('console-table-printer');

const { exec } = require("child_process");
const execFile = require('child_process').execFile;
const execSync = require('child_process').execSync;

const process = require('process');

const {resolve} = require('path');
const resolvepath = require('path').resolve;
const fs = require('fs');
const WebSocket = require('ws');
const chokidar = require('chokidar');

var minify = require('html-minifier').minify;
var minifyHTML = require('express-minify-html');

//### end of required external libraries


//### start of required internal classes
const pageRenderer = require('./main/page-renderer.js')
const pageRendererObj = new pageRenderer();

const exportSite = require('./main/export.js')
const exportSiteObj = new exportSite();

const createSite = require('./main/create.js')
const createSiteObj = new createSite();

const awsManager = require('./deploy/awsManager.js')
const awsManagerObj = new awsManager();

const prevUtils = require('./main/utils.js')
const prevUtilsObj = new prevUtils();
//### end of required internal classes


//### start of global variables
var DEFAULT_DIRS = new Object();
DEFAULT_DIRS["DRAFTS"] = true;
DEFAULT_DIRS["STATIC"] = true;
DEFAULT_DIRS["PARTIALS"] = true;
DEFAULT_DIRS["TEMPLATES"] = true;

global.DEFAULT_DIRS = DEFAULT_DIRS;
global.DEBUG = true;
global.LOCAL_PREVIEW = false;

global.pconfig = new Object();

global.app = express();


//Set the view engine to ejs
global.app.set('view engine', 'ejs');

//parse request body as JSON post request
global.app.use(express.json());

//for read the urlencode data
global.app.use(express.urlencoded({
    extended: true
}))

//### end of global variable

//to check if an command line argument matched
var argPresent = false;

//parse recipe.json file and set global variables
function processRecipe(recipe)
{
	try {
		
	recipe = recipe.trim();
	let configdata = fs.readFileSync(recipe);
	
		if(configdata)
		{
			recipe = resolvepath(recipe);
			
			global.pconfig = JSON.parse(configdata);
			
			if(!global.pconfig.port)
			global.pconfig.port = 3000;
			
			//local path of website folder
			global.pconfig.localpath = recipe.replace("recipe.json","");			
			
			if(!global.pconfig.production_url)
			global.pconfig.production_url = "http://localhost:"+global.pconfig.port;
			
			if(!global.pconfig.exportdir)
			global.pconfig.exportdir = global.pconfig.localpath+"out"+path.sep;
			
			if(!global.pconfig.createdir)
			global.pconfig.createdir = recipe;			
			
			//global expressjs static folder path
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

//--run argument for starting local server to preview website
if(process.argv.length == 4 && process.argv[2].trim() == "--run" && process.argv[3].includes("recipe.json"))
{
	argPresent = true;
	processRecipe(process.argv[3]);
	
	
	var wssadded = false;
	
	//expressjs server to start listening
	global.app.listen(global.pconfig.port, () => {
		
		//watch for any file changes
		chokidar.watch(global.pconfig.localpath, {ignoreInitial: true}).on('all', (event, path) => {
			
			if(wss)
			{
				//send to all clients based on file changes
				
				//TODO: Need better handling of which client needs to be updated
				
				try
				{
					wss.clients.forEach((client) => {
						
						//prune path variable from chokidar to match with browser client's address
						path = path.replace(global.pconfig.localpath,"");
						path = path.replace("/index.ejs","");
						path = path.replace(path.sep+"index.ejs","");
						path = path.replace("index.ejs","");
						
		    			client.send(path);
		  			});
				}
				catch(e)
				{
					
				}
			}
		 });
				
		
		wssadded = true;
		
		const wss = new WebSocket.Server({ port: 7071 });

		//Handle incoming message from browser clients
		 wss.on('message', (messageAsString) => {
			
			//alert(messageAsString);
			
			
		 });	
	
		//Enable local preview flag
	    global.LOCAL_PREVIEW = true;
		global.pconfig.local_url = "http://localhost:"+global.pconfig.port;
		console.log("Local preview server running on URL: "+global.pconfig.local_url);

	});
	
}	

//--export argument to export prevjs site to a specific folder
if(process.argv.length == 4 && process.argv[2].trim() == "--export" && process.argv[3].includes("recipe.json"))
{
	argPresent = true;
	console.log("Exporting site");
	processRecipe(process.argv[3]);
	
	
	//minification configuration
	
	if(global.pconfig.optimize.minify_html == "false")
	{
		//stub
	}
	else
	{
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
	}
	
	exportSiteObj.export();

}	

//--create argument to create a new prevjs site structure to a specific folder
if(process.argv.length == 4 && process.argv[2].trim() == "--create")
{
	argPresent = true;
	console.log("Creating site");
	global.pconfig = new Object();
	global.pconfig.createdir = process.argv[3];
	
	createSiteObj.createLocal('basic');
	
}	

//--create argument to create a new prevjs site structure to a specific folder
if(process.argv.length == 5 && process.argv[2].trim() == "--create")
{
	argPresent = true;
	console.log("Creating site");
	global.pconfig = new Object();
	global.pconfig.createdir = process.argv[4].trim();
	
	createSiteObj.createLocal(process.argv[3].trim());
	
}

//--deploy argument to deploy an exported prevjs site to AWS. Depends upon already setup aws command
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


//--list-recipes argument to deploy an exported prevjs site to AWS. Depends upon already setup aws command
if(process.argv.length == 4 && process.argv[2].trim() == "--list-recipes" && process.argv[3].trim() == "local")
{
	argPresent = true;
	
		
	listLocalRecipes();
	
	
}


if(process.argv.length == 3 && process.argv[2].trim() == "--list-recipes")
{
	argPresent = true;
	
		
	listLocalRecipes();
	
	
}		

function listLocalRecipes()
{
	console.log("Listing local recipes");
	
	var srcDataDir = path.join(__dirname, "recipes/list.json");
	
	
	fs.readFile(srcDataDir, "utf8", (err, jsonString) => {
		  
		var obj = JSON.parse(jsonString);
		
		const p = new Table();
		p.addRows(obj, { color: 'blue' });


		p.printTable();
		process.exit();
		
	});
}



//Declare routes

//Preview website in local (Note: not for production use)
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
  .version('0.1.6')
  .option('--list-recipes local','List locally available website recipes')
  .option('--create <path-to-create-new-site>','Enter local path for creating a new prevjs site')
  .option('--create <recipe-id> <path-to-create-new-site>','Enter local path to install a particular recipe')
  .option('--run <path-to-recipe.json>','To preview website in local server')
  .option('--export <path-to-recipe.json>','To export website')
  .option('--deploy <path-to-recipe.json>','To deploy exported website');

program.parse();

const options = program.opts();


	if(!argPresent)
	{
		 program.help();
	}




