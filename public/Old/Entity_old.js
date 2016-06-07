if(typeof require !== 'undefined')
{
	var THREE = require('./three.min.js');
}

Entity = function()
{
	this.position = new THREE.Vector3(0,0,0);
	this.velocity = new THREE.Vector3(0,0,0);
	this.id = -1;
	//Initial conditions to send clients
	this.changes = [{key: "position",value: this.position},
					{key: "velocity",value: this.velocity}];
	this.justCreated = true;
}
Entity.prototype.getID = function()
{
	return this.id;
}
Entity.prototype.setID = function(id)
{
	this.id = id;
}
Entity.prototype.getChanges = function()
{
	return this.changes;
}
Entity.prototype.addChange = function(change)
{
	this.changes.push(change);
}
Entity.prototype.clearChanges = function()
{
	this.changes = [];
}
Entity.prototype.setPosition = function(position){
	this.position = position;
}
Entity.prototype.setVelocity = function(velocity)
{
	this.velocity = velocity;
}
Entity.prototype.getPosition = function()
{
	return this.position;
}
Entity.prototype.getVelocity = function()
{
	return this.velocity;
}

Entity.prototype.update = function()
{
	if(!this.justCreated)
	{
		this.clearChanges();
	}else{
		this.justCreated = false;
	}

	newposition = new THREE.Vector3();
	oldposition = this.position;
	newposition.addVectors(this.position,this.velocity);
	this.setPosition(newposition);
	if(newposition.distanceTo(oldposition) > 0)
		this.addChange({key: "position",value: newposition});
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = Entity;
else
    window.Entity = Entity;