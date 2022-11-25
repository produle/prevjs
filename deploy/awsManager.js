
const AWS = require('aws-sdk');
const path = require('path');
const { exec } = require("child_process");
const execFile = require('child_process').execFile;
const execSync = require('child_process').execSync;
const process = require('process');
const {resolve} = require('path');
const fs = require('fs');


const prevUtils = require('../main/utils.js')
const prevUtilsObj = new prevUtils();


 class awsManager
 {
		 //CHANGE BELOW VARS BASED ON PRODUCTION OR DEV
	
	
		 deploy()
		 {
			if(!prevUtilsObj.emptyVar(global.pconfig.deploy.aws_id) || !prevUtilsObj.emptyVar(global.pconfig.deploy.aws_secret))
			{
				console.log("AWS ID and Secret Key is required in recipe.json for deployment");
				process.exit()
			}
			
			
			 AWS.config.update({
			 accessKeyId: global.pconfig.deploy.aws_id,
			 secretAccessKey: global.pconfig.deploy.aws_secret,
				region: global.pconfig.deploy.aws_region,
				 httpOptions: {timeout: 1020000 }
			 });
	
				this.s3 = new AWS.S3({
							accessKeyId: global.pconfig.deploy.aws_id,
							secretAccessKey: global.pconfig.deploy.aws_secret,
							useAccelerateEndpoint: true
			 });
	
				 
				this.cfront = new AWS.CloudFront({
							accessKeyId: global.pconfig.deploy.aws_id,
							secretAccessKey: global.pconfig.deploy.aws_secret,
			 });

			 try {
					var outfolder = global.pconfig.exportdir;

					outfolder = resolve(global.pconfig.exportdir);


					 var result = execSync("aws s3 sync "+outfolder+" s3://"+s3bucket+"/ --delete --acl public-read");

					console.log(result.toString());

					var cfarr = cfdistributions.split(",");

					if(cfarr.length > 0)
					{
						for(var k=0;k<cfarr.length;k++)
						{
							 var res = execSync('aws cloudfront create-invalidation --distribution-id '+cfarr[k]+' --paths "/*"');
							console.log(res.toString());
						}
					}

					process.exit();

				} catch (ex) {
					console.log(ex);
					process.exit();

				}


		 }

 };

module.exports = awsManager;
