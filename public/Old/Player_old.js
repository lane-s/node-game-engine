if(typeof require !== 'undefined')
{
	var THREE = require('./three.min.js');
	var Entity = require('./Entity');
	var inputState = require('./inputState');
}

Player = function()
{
	Entity.call(this);
	this.inputState = new inputState();
}

Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

var accel = 10;
var brakeAccel = 10;
var maxVelocity = 50;

Player.prototype.handleInputState = function()
{
	velocity = this.getVelocity();
	oldvelocity = velocity;
	if(this.inputState.getHorizontal() > 0)
	{
		velocity.setX(velocity.x+accel);
	}else if(this.inputState.getHorizontal() < 0)
	{
		velocity.setX(velocity.x-accel);
	}else
	{
		if(velocity.x > 0)
		{
			velocity.setX(velocity.x-brakeAccel);
			if(velocity.x < 0)
				velocity.setX(0);
		}else
		{
			velocity.setX(velocity.x+brakeAccel)
			{
				if(velocity.x > 0)
					velocity.setX(0);
			}
		}
	}

	velocity.setX(Math.max(Math.min(velocity.x,maxVelocity),-maxVelocity));

	if(this.inputState.getVertical() > 0)
	{
		velocity.setY(velocity.y+accel);
	}else if(this.inputState.getVertical() < 0)
	{
		velocity.setY(velocity.y-accel);
	}else
	{
		if(velocity.y > 0)
		{
			velocity.setY(velocity.y-brakeAccel);
			if(velocity.y < 0)
				velocity.setY(0);
		}else
		{
			velocity.setY(velocity.y+brakeAccel)
			{
				if(velocity.y > 0)
					velocity.setY(0);
			}
		}
	}
	velocity.setY(Math.max(Math.min(velocity.y,maxVelocity),-maxVelocity));
	if(oldvelocity.distanceTo(velocity) > 0)
	{
		this.addChange({key:"velocity" ,value: velocity});
	}
	this.setVelocity(velocity);
}

Player.prototype.update = function()
{
	Object.getPrototypeOf(Player.prototype).update.call(this);
	this.handleInputState();
}

Player.prototype.setInputState = function(inputState)
{
	this.inputState = inputState;
}

Player.prototype.getInputState = function()
{
	return this.inputState;
}
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = Player;
else
    window.Player = Player;