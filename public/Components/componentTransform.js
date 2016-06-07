if(typeof require !== 'undefined')
{
	var THREE = require('../three.min.js');
}

componentTransform = function(position)
{
	this.position = position || new THREE.Vector3(0,0,0);
}


componentTransform.prototype.name = "transform";

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = componentTransform;