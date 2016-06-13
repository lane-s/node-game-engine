if(typeof require !== 'undefined')
{
	var THREE = require('../lib/three.min.js');
}

ComponentPhysics = function(velocity)
{
	this.velocity = velocity || new THREE.Vector3(0,0,0);
}


ComponentPhysics.prototype.name = "physics";

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = ComponentPhysics;