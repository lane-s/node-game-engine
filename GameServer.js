var bson = require("bson");
var BSON = new bson.BSONPure.BSON();
var Entity = require('./public/Entity');
var SystemServerInput = require('./public/Systems/SystemServerInput');
var SystemPhysics = require('./public/Systems/SystemPhysics');
var THREE = require('./public/lib/three.min.js');
GameServer = function(tickRate)
{
	this.tickRate = tickRate;
	console.log("Game server running at a tickrate of "+tickRate+"ms");
	this.changeList = [];
	this.changeTable = {};
}

//integrates changes from a system into the main list/table
//Data is sent with components in a list rather than properties of a components object
GameServer.prototype.integrateChanges = function(integrateList)
{
	for(var i = 0; i < integrateList.length; i++)
	{
		var entity = integrateList[i];
		var index = this.changeTable[entity.id];
		if(!index)
		{
			var newEntity = {};
			newEntity.id = entity.id;
			newEntity.components = [];
			this.changeList.push(newEntity);
			index = this.changeList.length-1;
			this.changeTable[entity.id] = index;
		}
		for(var j = 0; j < entity.components.length; j++)
		{
			var foundComponent = false;
			for(var k = 0; k < this.changeList[index].components.length; k++)
			{
				if(this.changeList[index].components[k].name === entity.components[j].name)
				{
					foundComponent = true;
					this.changeList[index].components[k] = entity.components[j];
				}
			}
			if(!foundComponent)
				this.changeList[index].components.push(entity.components[j]);
		}
	}
}

GameServer.prototype.init = function(entityManager)
{


}
//The main loop which runs at a set interval to do game logic
GameServer.prototype.update = function(userManager, entityManager,wss)
{
	var server = this;
	setInterval(function(){
	//Create list of entity changes to build during the update
	//Systems return a list of changes made by the system
	server.changeList = [];
	server.changeTable = {};

	//Initialize systems
	systemPhysics = new SystemPhysics();
	systemServerInput = new SystemServerInput();

	//Loop through all entities and run systems that apply to individual entities
	for(var i = 0; i < entityManager.getEntityList().length; i++)
	{
		var entity = entityManager.getEntity(entityManager.getEntityList()[i]);
		//Handle creation of entities/components
		if(entity.components.created.componentList.length > 0)
		{
			var componentList = entity.components.created.componentList;
			server.integrateChanges([ {id: entity.getID(),components: componentList } ]);
			entity.components.created.componentList = [];
		}

		//Handle removal of entities/components
		if(entity.components.removed.removeEntity)
		{
			//If the removeEntity flag is true, we integrate the entity into the changes so the client knows to remove the entity
			server.integrateChanges([entity.getData()]);
			//We also completely delete the entity from the manager
			entityManager.deleteFromList(i);
			continue; //No need to run systems on this entity
		}else if(entity.components.removed.componentList.length > 0)
		{
			//Otherwise we just want to remove certain components from an entity
			server.integrateChanges([ {id: entity.getID(),components: [entity.components.removed] } ]);
			entity.components.removed.componentList = [];
		}

		//Run systems for individual entities
		server.integrateChanges(systemServerInput.update(entity,userManager));
		server.integrateChanges(systemPhysics.update(entity));

	}

	//Send changes to client
	if(server.changeList.length > 0)
	{
		//console.log(JSON.stringify(server.changeList));
		var changeMsg = {id:'entityChanges',content: server.changeList}
		//console.log(changeMsg.id);
		wss.broadcast(BSON.serialize(changeMsg));
	}

	},this.tickRate);
}

module.exports = GameServer;