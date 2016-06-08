if (typeof require !== 'undefined' )
{
	var THREE = require('../lib/three.min.js');
}
var accel = 10;
var brakeAccel = 10;
var maxVelocity = 50;

SystemServerInput = function(entity, userManager)
{
	var changes = [];

	//Check if the entity is owned by a user
	if(entity.components.userOwned)
	{
		var owned = entity.components.userOwned;
		//Get the owner's input state
		var owner = userManager.getUserByID(owned.ownerID);
		var inputState = owner.getInputState();

		//Get the unit type of the entity
		var unitType = 'none';
		if(unit = entity.components.unit)
			unitType = unit.type;

		//Handle input for player's hero unit
		if(entity.components.physics && owned.controlEnabled && unitType === 'hero' && owned.ownerID != -1)
		{
				var velocity = entity.components.physics.velocity;
				var oldvelocity = new THREE.Vector3(velocity.x,velocity.y,velocity.z);

				if(inputState.getHorizontal() > 0)
				{
					velocity.setX(velocity.x+accel);
				}else if(inputState.getHorizontal() < 0)
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
						if(velocity.x > 0)
							velocity.setX(0);
					}
				}
				velocity.setX(Math.max(Math.min(velocity.x,maxVelocity),-maxVelocity));

				if(inputState.getVertical() > 0)
				{
					velocity.setY(velocity.y+accel);
				}else if(inputState.getVertical() < 0)
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
					//Add this entity's velocity to the change list
					var change = {};
					change.id = entity.getID();
					change.components = [entity.components.physics];
					changes.push(change);
				}
		}
	}
	return changes;
}
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = SystemServerInput;