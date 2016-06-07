viewManager = function()
{
	this.entityMeshes = {};
}

viewManager.prototype.addEntity = function(entity)
{
	if(entity.components.unit)
	{
		var unit = entity.components.unit;
		//Create the mesh for a hero character
		if(unit.type === 'hero')
		{
		console.log("Adding mesh for "+entity.getID());
		var geometry = new THREE.BoxGeometry( 200, 200, 200 );
		var material = new THREE.MeshBasicMaterial( { color: 0x0000ff, wireframe: false } );
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

viewManager.prototype.removeEntity = function(entity)
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
viewManager.prototype.updateEntity = function(entity)
{
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
				scene.remove(this.entityMeshes[entity.getID()]);
				delete this.entityMeshes[entity.getID()];
				return true;
				}
			}

		}else{
			this.addEntity(entity);
		}
		return false;
}

viewManager.prototype.updateAll = function(entityManager)
{
	for(i = 0; i < entityManager.getEntityList().length; i++)
	{
		var entity = entityManager.getEntity(entityManager.getEntityList()[i]);
		if(this.updateEntity(entity))
		{
			entityManager.deleteFromList(i);
		}
	}

}

window.viewManager = viewManager;