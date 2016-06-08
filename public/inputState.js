//This object contains possible input data from users as well as helper functions for relevant calculations
InputState = function(){
	this.left = 0;
	this.right = 0;
	this.up = 0;
	this.down = 0;
	this.vertical = 0;
	this.horizontal = 0;
}

InputState.prototype.setLeft = function(l)
{
	this.left = l;
}
InputState.prototype.setRight = function(r)
{
	this.right = r;
}
InputState.prototype.setUp = function(u)
{
	this.up = u;
}
InputState.prototype.setDown = function(d)
{
	this.down = d;
}

InputState.prototype.getVertical = function(v)
{
	return this.up-this.down;
}

InputState.prototype.getHorizontal = function(h)
{
	return this.right-this.left;
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = InputState;
else
    window.InputState = InputState;