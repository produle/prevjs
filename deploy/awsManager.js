
const AWS = require('aws-sdk');

 class awsManager
 {
	 //CHANGE BELOW VARS BASED ON PRODUCTION OR DEV
	

	  AWS_ID = '';
	  AWS_SECRET = '';
	  AWS_BUCKET = '';
	  AWS_REGION = '';
	  AWS_CF_DISTRIBUTIONS = ""; //separate multiple distributions by commas - dist_id1,dist_id2

		 //CHANGE BELOW VARS BASED ON PRODUCTION OR DEV
	
	  constructor()
	  {
		  AWS.config.update({
			 accessKeyId: this.AWS_ID,
			 secretAccessKey: this.AWS_SECRET,
				region: this.AWS_REGION,
				 httpOptions: {timeout: 1020000 }
		 });

			this.s3 = new AWS.S3({
						accessKeyId: this.AWS_ID,
						secretAccessKey: this.AWS_SECRET,
						useAccelerateEndpoint: true
		 });

			 this.cfront = new AWS.CloudFront({
						accessKeyId: this.AWS_ID,
						secretAccessKey: this.AWS_SECRET
		 });

		}

		 uploadSite()
		 {

			 try {
					var outfolder = "out";

					outfolder = resolve('out');


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
