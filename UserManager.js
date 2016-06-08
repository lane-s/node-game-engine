var bson = require("bson");
var BSON = new bson.BSONPure.BSON();
var User = require('./User');
var InputHandler = require('./InputHandler');
var AssemblageHero = require('./public/Components/AssemblageHero');
var THREE = require('./public/lib/three.min.js');

function UserManager()
{
	this.userList = [];
	this.userTable = {};
	this.freeIDs = [];
	this.lastID = -1;
}

UserManager.prototype.initUser = function(socket, entityManager)
{
	var id;
	//Find unique id for new user
	if(this.freeIDs.length > 0)
	{
		id = this.freeIDs.shift();
	}else
	{
		id = this.lastID+1;
		this.lastID = id;
	}

	//Create user
	var newUser = new User(id,socket);

	//Send game state to user
	this.sendGameState(socket, entityManager);

	//Create entities associated with a new user connecting (i.e. player character)
	this.createStartingEntities(newUser, entityManager);

	//Add user to list
	this.userList.push(newUser.getID());
	this.userTable[newUser.getID()] = newUser;

	console.log('user '+newUser.getID()+' connected');

	var manager = this;

	//When a user disconnects, remove them from the list and manage entities owned by the user
	socket.on('close', function disconnection(){
		var user = manager.getUserByConnection(socket);
		console.log('user '+user.getID()+' disconnected');
		manager.onOwnerDisconnect(user, entityManager);
		manager.removeUser(user);
	});

}

UserManager.prototype.onOwnerDisconnect = function(user, entityManager)
{
		var ownedEntities = user.getOwnedEntities();
		 for(var i = 0; i < ownedEntities.length; i++)
		 {
		 	var owned = entityManager.getEntity(ownedEntities[i]).components.userOwned;
		 	owned.ownerID = -1;
		 	if(owned.removeOnDisconnect)
		 	{
		 		entityManager.removeEntity(ownedEntities[i]);
		 		user.getOwnedEntities().splice(i,1);
		 	}
		 }
}

UserManager.prototype.createStartingEntities = function(user, entityManager)
{
	//Create player hero
	var hero = new Entity();
	hero.addAssemblage(new AssemblageHero(user.getID()));
	entityManager.addEntity(hero);
	user.addOwnedEntity(hero.getID());
}

UserManager.prototype.sendGameState = function(socket, entityManager)
{
	//Send game state to new user
	var changeList = [];
	//Iterate over all entities currently in the game
	for(var i = 0; i < entityManager.getEntityList().length; i++)
	{
		var entity = entityManager.getEntity(entityManager.getEntityList()[i]);
		changeList.push(entity.getData());
	}
	//Send the data to the client
	if(changeList.length > 0)
	{
		var changeMsg = {id:'entityChanges', content: changeList};
		socket.send(BSON.serialize(changeMsg));
	}
}

UserManager.prototype.getUsers = function()
{
	return this.userList;
}

UserManager.prototype.removeUser = function(user)
{
	ws = user.getConnection();
	for(i=0; i< this.userList.length; i++)
	{
		if(this.userList[i] == ws.id)
		{
			this.userList.splice(i,1);
			delete this.userTable[ws.id];
			this.freeIDs.push(ws.id);
		}
	}	
}

UserManager.prototype.getUserByConnection = function(ws)
{
	return this.userTable[ws.id];
}

UserManager.prototype.getUserByID = function(id)
{
	return this.userTable[id];
}

module.exports = UserManager;

