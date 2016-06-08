if(typeof require !== 'undefined')
{
	var THREE = require('../lib/three.min.js');
}

ComponentTransform = function(position)
{
	this.position = position || new THREE.Vector3(0,0,0);
}


ComponentTransform.prototype.name = "transform";

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = ComponentTransform;