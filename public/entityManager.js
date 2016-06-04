entityManager = function()
{
	this.entityList = [];
}

entityManager.prototype.updateAll = function()
{
	for(i = 0; i < this.entityList.length; i++)
	{
		changes = this.entityList[i].getChanges();
		skipUpdate = false;
		for(j = 0; j < changes.length; j++)
		{
			if(changes[j].key === 'removed')
			{
				skipUpdate = true;

				break;
			}
		}
		if(!skipUpdate)
			this.entityList[i].update();
	}
}


entityManager.prototype.addEntity = function(entity)
{
	foundID = true;
	id = 0;
	while(foundID)
	{
		id++;
		foundID = false;
		if(this.getEntity(id) != null)
		{
			foundID = true;
		}	
	}
	entity.setID(id);
	this.entityList.push(entity);
	return entity;
}

entityManager.prototype.getEntity = function(id)
{
	for(i = 0; i < this.entityList.length; i++)
	{
		if(this.entityList[i].getID() == id)
		{
			return this.entityList[i];
		}
	}
}

entityManager.prototype.removeEntity = function(id)
{
	for(i = 0; i < this.entityList.length; i++)
	{
		if(this.entityList[i].getID() == id)
		{
			this.entityList[i].addChange({key: "removed",value: "true"});
		}
	}
}

entityManager.prototype.deleteFromList = function(id)
{
	for(i = 0; i < this.entityList.length; i++)
	{
		if(this.entityList[i].getID() == id)
		{
			this.entityList.splice(i,1);
		}
	}
}

entityManager.prototype.getEntities = function()
{
	return this.entityList;
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = entityManager;
else
    window.entityManager = entityManager;