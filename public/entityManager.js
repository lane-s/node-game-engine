//The entity manager uses an array to hold all of the entities currently in the game
//It uses a table to access the entities quickly with the entity id
entityManager = function()
{
	this.entityList = [];
	this.entityTable = {};
	this.lastID = -1;
	this.freeIDs = [];

}

//Add entity with id that is unique to the session
entityManager.prototype.addEntity = function(entity)
{
	var id = entity.getID();
	if(id == -1)
	{
		if(this.freeIDs.length > 0)
		{
			id = this.freeIDs.shift();

		}else{
			id = this.lastID+1;
			this.lastID = id;
		}
	}

	entity.setID(id);
	this.entityList.push(id);
	this.entityTable[id] = entity;
	return entity;
}

entityManager.prototype.getEntity = function(id)
{
	return this.entityTable[id];
}

entityManager.prototype.removeEntity = function(id)
{
	this.entityTable[id].remove();
}

entityManager.prototype.deleteFromList = function(index)
{
	var id = this.entityList[index];
	this.freeIDs.push(id);
	delete this.entityTable[id]
	this.entityList.splice(index,1);
}

entityManager.prototype.getEntityList = function()
{
	return this.entityList;
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = entityManager;
else
    window.entityManager = entityManager;