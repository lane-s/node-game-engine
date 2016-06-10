Center = function(x,y)
{
	this.x = x | 0;
	this.y = y | 0;
	this.neighbors = []; //Adjacent polygons
	this.borders = []; //Bordering edges
	this.corners = []; //Set of corners
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = Center;
else
    window.Center = Center;
