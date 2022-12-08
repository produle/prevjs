
/*

File: utils.js

Description:

All common utility functions are called from here

*/


//### start of required external libraries

const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
//### end of required external libraries


class prevUtils
{

    isEmpty(variable)
	{
		
		
		if(variable == null)
		return true;
		
		if(variable == undefined)
		return true;
		
		if(variable.trim() == "")
		return true;
		
		return false;
		
	}

	//utility function to get directory hierarchy as a single level object
	getFlatStructure(flatarr,arr)
    {
		var self = this;
      for(var j=0;j<arr.length;j++)
      {
        var obj = new Object();
        obj.path = arr[j].path;
        obj.name = arr[j].name;

        flatarr.push(obj);

        if(arr[j].children)
        {
          self.getFlatStructure(flatarr,arr[j].children);
        }
      }
    }

	//utility function to get json data from URL. Used for dynamic templates
	fetchPageData(dataurl,tempname)
    {
	
	      return new Promise((resolve, reject) => {
		
				if(dataurl.includes("http"))
				{
	      
		      		fetch(dataurl, { method: "Get" })
				    .then(res => res.json())
				    .then((json) => {
				       	
				 			resolve(json);
				 
				    }).
					  catch(error => {
						 console.log(error)
					      reject(false);
					}); 
				
				}
				else
				{
					var lpath = global.pconfig.localpath+"TEMPLATES/"+tempname+"/"+dataurl;
					console.log(lpath)
					if (fs.existsSync(lpath)) 
					{
				    	fs.readFile(lpath, "utf8", (err, jsonString) => {
						  if (err) {
						    console.log("File read failed: " + lpath, err);
							reject(false);
						    return;
						  }
				
							var tempObj = JSON.parse(jsonString);
							
							resolve(tempObj);
			
						});
					  	
					}
					else
					{
						reject(false);
					}
				}
			
	      
	      	});
			
      
     }

	 getAllFiles(dirPath,arr,extensions)
		{
			var self = this;
	      fs.readdirSync(dirPath).forEach(function(file) {
	      let filepath = path.join(dirPath , file);
	      let stat= fs.statSync(filepath);
	      if (stat.isDirectory()) {            
	        self.getAllFiles(filepath,arr,extensions);
	      } else {
		
				if(extensions == null || extensions.length == 0)
				{
					arr.push(filepath);
				}
				else
				{
					for(var k=0;k<extensions.length;k++)
					{
						if(filepath.includes(extensions[k]))
						{
							arr.push(filepath);
							break;
						}
					}
				}
				
				
	                              
	      }    
	  	});  
	}
	
	 getFiles(dirPath, currentLevel, maxLevel,arr){
	  if (currentLevel > maxLevel){
	    return;
	  }
	  else{
	      fs.readdirSync(dirPath).forEach(function(file) {
	      let filepath = path.join(dirPath , file);
	      let stat= fs.statSync(filepath);
	      if (stat.isDirectory()) {            
	        getFiles(filepath, currentLevel+1, maxLevel);
	      } else {
		
	            if(extensions == null || extensions.length == 0)
				{
					arr.push(filepath);
				}
				else
				{
					for(var k=0;k<extensions.length;k++)
					{
						if(filepath.includes(extensions[k]))
						{
							arr.push(filepath);
							break;
						}
					}
				}                 
	        }    
	  });
	  }
	}

	//Utility function to list directories from a given path
	getDirectories = (source, callback) =>
	  readdir(source, { withFileTypes: true }, (err, files) => {
	    if (err) {
	      callback(err)
	    } else {
	      callback(
	        files
	          .filter(dirent => dirent.isDirectory())
	          .map(dirent => dirent.name)
	      )
	    }
  	});

	 insertTag(newTag, html) {
	  var end = html.indexOf('</head>');
	  return html.htmlsplice(end, 0, newTag);
	}
	
	
	removeTrailingSlash(str) {
  		return str.replace(/\/+$/, '');
	}

};

module.exports = prevUtils

//utility external function to modify html
String.prototype.htmlsplice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};


