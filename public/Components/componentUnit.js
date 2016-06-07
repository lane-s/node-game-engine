componentUnit = function(type)
{
	this.type = type || "none"
	//unit stats
}


componentUnit.prototype.name = "unit";

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = componentUnit;