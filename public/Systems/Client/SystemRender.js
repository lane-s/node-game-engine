THREE = require('three');

SystemRender = function()
{
	this.entityMeshes = {};
}

SystemRender.prototype.addEntity = function(entity,scene)
{
	if(entity.components.unit)
	{
		var unit = entity.components.unit;
		//Create the mesh for a hero character
		if(unit.type === 'hero')
		{
		console.log("Adding mesh for "+entity.getID());
		var geometry = new THREE.BoxGeometry( 200, 200, 200 );
		var material = new THREE.MeshBasicMaterial( { color: 0x000000+unit.color, wireframe: false } );
 		var mesh = new THREE.Mesh( geometry, material );
 		var position = entity.components.transform.position;
 		mesh.position.set(position.x,position.y,position.z);
 		this.entityMeshes[entity.getID()] = mesh;
		scene.add( mesh );
		return true;
		}
	}
	this.entityMeshes[entity.getID()] = 'none';
	return false;
}

SystemRender.prototype.removeEntity = function(entity,scene)
{
	if(this.entityMeshes[entity.getID()])
	{
	console.log("Removing mesh");
	scene.remove(this.entityMeshes[entity.getID()]);
	delete this.entityMeshes[entity.getID()];
	return true;
	}
	return false;
}

//Update entities in the view, return true if removed
SystemRender.prototype.updateEntity = function(entity,scene)
{
		//
		if(this.entityMeshes[entity.getID()] != 'none' && typeof this.entityMeshes[entity.getID()] !== 'undefined')
		{
			//Handle position updates
			if(entity.components.transform)
			{
			var transform = entity.components.transform;
			this.entityMeshes[entity.getID()].position.set(transform.position.x,transform.position.y,transform.position.z);
			}

			//Handle entity removal
			if(entity.components.removed)
			{
				var remove = entity.components.removed;
				if(remove.removeEntity)
				{
					this.removeEntity(entity,scene);
					return true;
				}
			}

		}else if(this.entityMeshes[entity.getID()] != 'none'){
			this.addEntity(entity,scene);
		}
		return false;
}

SystemRender.prototype.update = function(entityManager,scene)
{
	for(i = 0; i < entityManager.getEntityList().length; i++)
	{
		var entity = entityManager.getEntity(entityManager.getEntityList()[i]);
		if(this.updateEntity(entity,scene))
		{
			entityManager.deleteFromList(i);
		}
	}

}

module.exports = SystemRender;