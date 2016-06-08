if (typeof require !== 'undefined' )
{
	var THREE = require('../lib/three.min.js');
}

SystemPhysics = function()
{
}

SystemPhysics.prototype.update = function(entity)
{
	var changes = [];

	if(entity.components.physics && entity.components.transform)
	{
		var position = entity.components.transform.position;
		var oldposition = new THREE.Vector3(position.x,position.y,position.z);
		position.add(entity.components.physics.velocity);
		if(position.distanceTo(oldposition) > 0)
		{
			var change = {};
			change.id = entity.getID();
			change.components = [entity.components.transform];
			changes.push(change);
		}
	}

	return changes;
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = SystemPhysics;