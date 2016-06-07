var Entity = require('./public/Entity');
var inputState = require('./public/inputState');

function User(id,ws)
{
		this.id = id;
		this.ws = ws;
		this.ownedEntities = [];
		this.inputState = new inputState();
}
User.prototype.getID = function(){
		return this.id;
}
User.prototype.getConnection = function()
{
	return this.ws;
}
User.prototype.getInputState = function ()
{
	return this.inputState;
}
User.prototype.setInputState = function(newState)
{
	this.inputState = newState;
}
User.prototype.addOwnedEntity = function(id)
{
	this.ownedEntities.push(id);
}
User.prototype.removeOwnedEntity = function(id)
{
	for(i = 0; i < this.ownedEntities.length; i++)
	{
		if(this.ownedEntities[i] == id)
		{
			this.ownedEntities.splice(i,1);
			break;
		}
	}
}
User.prototype.getOwnedEntities = function()
{
	return this.ownedEntities;
}
module.exports = User;