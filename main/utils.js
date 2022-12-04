
/*

File: utils.js

Description:

All common utility functions are called from here

*/


//### start of required external libraries

const fetch = require('node-fetch');

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

	//utility function to get directory hierarchy
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
	fetchPageData(dataurl)
    {
	
	      return new Promise((resolve, reject) => {
	      
	      		fetch(dataurl, { method: "Get" })
			    .then(res => res.json())
			    .then((json) => {
			       	
			 			resolve(json);
			 
			    }).
				  catch(error => {
				      reject(false);
				}); 
	      
	      });
      
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

};

module.exports = prevUtils

//utility external function to modify html
String.prototype.htmlsplice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};


