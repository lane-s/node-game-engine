if(typeof require !== 'undefined')
{
	var THREE = require('../three.min.js');
}

componentPhysics = function(velocity)
{
	this.velocity = velocity || new THREE.Vector3(0,0,0);
}


componentPhysics.prototype.name = "physics";

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = componentPhysics;