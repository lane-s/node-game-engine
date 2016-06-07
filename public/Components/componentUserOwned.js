componentUserOwned = function(id, removeOnDisconnect)
{
	this.ownerID = id;
	this.removeOnDisconnect = removeOnDisconnect || false;
	this.controlEnabled = true;
}

componentUserOwned.prototype.name = 'userowned';

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = componentUserOwned;