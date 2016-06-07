var bson = require("bson");
var BSON = new bson.BSONPure.BSON();
var User = require('./User');
var inputHandler = require('./inputHandler');
var assemblageHero = require('./public/Components/assemblageHero');
var THREE = require('./public/three.min.js');

function userManager()
{
	this.userList = [];
	this.userTable = {};
	this.freeIDs = [];
	this.lastID = -1;
}

userManager.prototype.initUser = function(socket, entityManager)
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
	socket.id = id;
	var newUser = new User(id,socket);

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

	//Create player hero
	var hero = new Entity();
	hero.addAssemblage(new assemblageHero(newUser.getID()));
	entityManager.addEntity(hero);
	newUser.addOwnedEntity(hero.getID());
	//Add user to list
	this.userList.push(newUser.getID());
	this.userTable[newUser.getID()] = newUser;

	console.log('user '+newUser.getID()+' connected');

	var manager = this;

	//When a user disconnects, remove them from the list and manage entities owned by the user
	socket.on('close', function disconnection(){
		var user = manager.getUserByConnection(socket);
		console.log('user '+user.getID()+' disconnected');
		var ownedEntities = user.getOwnedEntities();
		 for(var i = 0; i < ownedEntities.length; i++)
		 {
		 	var owned = entityManager.getEntity(ownedEntities[i]).components.userowned;
		 	owned.ownerID = -1;
		 	if(owned.removeOnDisconnect)
		 	{
		 		entityManager.removeEntity(ownedEntities[i]);
		 		user.getOwnedEntities().splice(i,1);
		 	}
		 }
		 manager.removeUser(socket);
	});

}

userManager.prototype.getUsers = function()
{
	return this.userList;
}

userManager.prototype.removeUser = function(ws)
{
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

userManager.prototype.getUserByConnection = function(ws)
{
	return this.userTable[ws.id];
}

userManager.prototype.getUserByID = function(id)
{
	return this.userTable[id];
}

module.exports = userManager;

