

/*

File: awsManager.js

Description:

To deploy a exported prevjs site to aws infrastructure

*/


//### start of required external libraries

const path = require('path');
const { exec } = require("child_process");
const execFile = require('child_process').execFile;
const execSync = require('child_process').execSync;
const process = require('process');
const {resolve} = require('path');
const fs = require('fs');

var commandExists = require('command-exists');
//### end of required external libraries

//### start of required internal classes

const prevUtils = require('../main/utils.js')
const prevUtilsObj = new prevUtils();

//### end of required internal classes


 class awsManager
 {
		 //CHANGE BELOW VARS BASED ON PRODUCTION OR DEV
	
	
		 //deploy to AWS cloudfront and S3
		 //Requires aws command from aws.amazon.com to be installed and setup before using this
		 deploy()
		 {
			
			if(prevUtilsObj.isEmpty(global.pconfig.deploy.aws_bucket))
			{
				console.log("AWS bucket name is required in recipe.json for deployment");
				process.exit();
			}
			

			 try {
				
			 //check if command exists
			 commandExists('aws', function(err, commandExists) {
 
    		if(commandExists) {
					var outfolder = global.pconfig.exportdir;

					outfolder = resolve(global.pconfig.exportdir);


					 //first sync all exported files in site with s3 bucket
					 var result = execSync("aws s3 sync "+outfolder+" s3://"+global.pconfig.deploy.aws_bucket+"/ --delete --acl public-read");

					console.log(result.toString());
					
					if(!prevUtilsObj.isEmpty(global.pconfig.deploy.aws_cfdistributions))
					{
						var cfarr = global.pconfig.deploy.aws_cfdistributions.split(",");
	
						if(cfarr.length > 0)
						{
							for(var k=0;k<cfarr.length;k++)
							{
								//invalidate related cloudfront distributions
								 var res = execSync('aws cloudfront create-invalidation --distribution-id '+cfarr[k]+' --paths "/*"');
								console.log(res.toString());
							}
						}
					}

					process.exit();
					
				  }
				  else
				  {
					console.log("aws CLI has to be installed and setup before calling deploy. Refer https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html.");
				  }
		
				});

				} 
				catch (ex) {
					console.log(ex);
					process.exit();

				}

			
		 }

 };

module.exports = awsManager;
