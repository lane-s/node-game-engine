if(typeof require !== 'undefined')
{
var componentUnit = require('./componentUnit');
var componentTransform = require('./componentTransform');
var componentPhysics = require('./componentPhysics');
var componentUserOwned = require('./componentUserOwned');
}

assemblageHero = function(id)
{
	this.id = id;
	this.componentList = [new componentUnit('hero'), new componentTransform(),
	  new componentPhysics(), new componentUserOwned(id,true)];
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = assemblageHero;