inputState = function(){
	this.left = 0;
	this.right = 0;
	this.up = 0;
	this.down = 0;
	this.vertical = 0;
	this.horizontal = 0;
}

inputState.prototype.setLeft = function(l)
{
	this.left = l;
}
inputState.prototype.setRight = function(r)
{
	this.right = r;
}
inputState.prototype.setUp = function(u)
{
	this.up = u;
}
inputState.prototype.setDown = function(d)
{
	this.down = d;
}

inputState.prototype.getVertical = function(v)
{
	return this.up-this.down;
}

inputState.prototype.getHorizontal = function(h)
{
	return this.right-this.left;
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = inputState;
else
    window.inputState = inputState;