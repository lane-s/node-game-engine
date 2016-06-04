var bson = require("bson");
var BSON = new bson.BSONPure.BSON();
var Player = require('./public/Player');

gameServer = function(tickRate)
{
	this.tickRate = tickRate;
}

gameServer.prototype.handleEntityChanges = function(entityManager,wss)
{
	entities = entityManager.getEntities();


	allChanges = [];
	for(i = 0; i < entities.length; i++)
	{
		entityChanges = entities[i].getChanges();
		if(entityChanges.length > 0)
		{
			myType = 'Entity';
			if(entities[i] instanceof Player)
			{
				myType = 'Player';
			}

			changeData = {key: entities[i].getID(), value: entityChanges, type: myType};
			allChanges.push(changeData);
			for(j = 0; j < entityChanges.length; j++)
			{
				if(entityChanges[j].key === 'removed')
				{
					entityManager.deleteFromList(entities[i].getID());
				}
			}
		}
	}
	if(allChanges.length > 0)
	{
	changeMsg = {id:'entityChanges',content: allChanges}
	//console.log(changeMsg.id);
	wss.broadcast(BSON.serialize(changeMsg));
	}
}

gameServer.prototype.update = function(entityManager,wss)
{
	tickRate = this.tickRate;
	server = this;
	setInterval(function(){
		entityManager.updateAll();
		server.handleEntityChanges(entityManager,wss);
	},tickRate)
}

module.exports = gameServer;