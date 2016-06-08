ComponentUnit = function(type)
{
	this.type = type || "none"
	//unit stats
}


ComponentUnit.prototype.name = "unit";

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = ComponentUnit;