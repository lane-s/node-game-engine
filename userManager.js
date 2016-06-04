var User = require('./User');
var inputHandler = require('./inputHandler');
var THREE = require('./public/three.min.js');

function userManager()
{
	this.userList = [];
}

userManager.prototype.initUser = function(socket, entityManager)
{
	foundID = true;
	id = 0;
	while(foundID)
	{
		id++;
		foundID = false;
		if(this.getUserByID(id) != null)
		{
			foundID = true;
		}	
	}
	socket.id = id;
	newUser = new User(id,socket);
	newEntity = entityManager.addEntity(newUser.getPlayer());


	this.userList.push(newUser);

	console.log('user '+newUser.getID()+' connected');
	for(i=0; i < this.userList.length; i++)
	{
		console.log(this.userList[i].getID());
	}

	manager = this;
	socket.on('close', function disconnection(){
		user = manager.getUserByConnection(socket);
		console.log('user '+user.getID()+' disconnected');
		manager.removeUser(socket);
		entityManager.removeEntity(user.getPlayer().getID());
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
		if(this.userList[i].getID() == ws.id)
		{
			this.userList.splice(i,1);
		}
	}	
}

userManager.prototype.getUserByConnection = function(ws)
{
	for(i=0; i< this.userList.length; i++)
	{
		if(this.userList[i].getID() == ws.id)
		{
			return this.userList[i];
		}
	}	
}

userManager.prototype.getUserByID = function(id)
{
	for(i=0; i< this.userList.length; i++)
	{
		if(this.userList[i].getID() == id)
		{
			return this.userList[i];
		}
	}	
}

module.exports = userManager;

