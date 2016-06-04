var Player = require('./public/Player');

function User(id,ws)
{
		this.id = id;
		this.ws = ws;
		this.player = new Player();
}
User.prototype.getID = function(){
		return this.id;
}
User.prototype.getPlayer = function()
{
	return this.player;
}
User.prototype.getConnection = function()
{
	return this.ws;
}

module.exports = User;