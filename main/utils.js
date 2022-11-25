

class prevUtils
{

    emptyVar(variable)
	{
		if(isNaN(variable))
		return false;
		
		if(variable == null)
		return false;
		
		if(variable == undefined)
		return false;
		
		if(variable.trim() == "")
		return false;
		
	}


};

module.exports = prevUtils
