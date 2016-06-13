ComponentUserOwned = function(id, removeOnDisconnect)
{
	this.ownerID = id;
	this.removeOnDisconnect = removeOnDisconnect || false;
	this.controlEnabled = true;
}

ComponentUserOwned.prototype.name = 'userOwned';

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = ComponentUserOwned;