ComponentUnit = function(type)
{
	this.type = type || "none"
	this.color = Math.floor(Math.random()*16777215); //Random color
	//unit stats
}


ComponentUnit.prototype.name = "unit";

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = ComponentUnit;