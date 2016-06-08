if(typeof require !== 'undefined')
{
var ComponentUnit = require('./ComponentUnit');
var ComponentTransform = require('./ComponentTransform');
var ComponentPhysics = require('./ComponentPhysics');
var ComponentUserOwned = require('./ComponentUserOwned');
}

AssemblageHero = function(id)
{
	this.id = id;
	this.componentList = [new ComponentUnit('hero'), new ComponentTransform(),
	  new ComponentPhysics(), new ComponentUserOwned(id,true)];
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = AssemblageHero;