

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


};

module.exports = prevUtils
