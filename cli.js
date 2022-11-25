#!/usr/bin/env node
const { program } = require('commander');
const prevjs = require('./prev.js');
const prevjsObj = new prevjs();

const process = require('process');

program
  .name('prevjs')
  .description('Static website builder')
  .version('0.0.1')
  .option('--run <type>','To preview webite in local server');

program.parse();

const options = program.opts();

if (process.argv.length < 3) 
{
  program.help();
}
else
{
	if(options.run)
	{
		prevjsObj.viewSite(options.run);
	}
	
}


