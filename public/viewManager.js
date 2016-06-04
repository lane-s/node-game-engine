viewManager = function()
{
	this.entityMeshes = [];
}

viewManager.prototype.addEntity = function(entity)
{
	added = false;
	if(entity instanceof window.Player)
	{
		geometry = new THREE.BoxGeometry( 200, 200, 200 );
		material = new THREE.MeshBasicMaterial( { color: 0x0000ff, wireframe: false } );
 		mymesh = new THREE.Mesh( geometry, material );
 		this.entityMeshes.push({id: entity.getID(), mesh: mymesh});
		scene.add( mymesh );
		added = true;
	}
	return added;
}

viewManager.prototype.removeEntity = function(entity)
{
	removed = false;
	for(i = 0; i < this.entityMeshes.length; i++)
	{
		if(this.entityMeshes[i].id == entity.getID())
		{
			scene.remove(this.entityMeshes[i].mesh);
			this.entityMeshes[i].splice(i,1);
			removed = true;
		}
	}
	return removed;
}

viewManager.prototype.updateEntity = function(entity)
{
	updated = false;
	for(i = 0; i < this.entityMeshes.length; i++)
	{
		if(this.entityMeshes[i].id == entity.getID())
		{
			this.entityMeshes[i].mesh.position.set(entity.getPosition().x,entity.getPosition().y,entity.getPosition().z);
			updated = true;
		}
	}
	return updated;
}

viewManager.prototype.updateAll = function(entityManager)
{
	entities = entityManager.getEntities();
	for(i = 0; i < entities.length; i++)
	{
		foundMesh = false;
		for(j = 0; j < this.entityMeshes.length; j++)
		{
			if(this.entityMeshes[j].id == entities[i].getID())
			{
				foundMesh = true;
				this.entityMeshes[i].mesh.position.set(entities[i].getPosition().x,entities[i].getPosition().y,entities[i].getPosition().z);
				changes = entities[i].getChanges();
				for(k = 0; k < changes.length; k++)
				{
					if(changes[k].key === 'removed')
					{
						entityManager.deleteFromList(this.entityMeshes[j].id);
						scene.remove(this.entityMeshes[j].mesh);
						this.entityMeshes.splice(j,1);
					}
				}
			}
		}
		if(!foundMesh)
		{
			this.addEntity(entities[i]);
			this.updateEntity(entities[i]);
		}
	}


}

window.viewManager = viewManager;