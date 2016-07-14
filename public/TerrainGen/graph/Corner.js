Corner = function(x,y)
{
	this.x = x | 0;
	this.y = y | 0;
	this.touches = []; //Set of polygons this corner is part of
	this.protrudes = []; //Set of edges protruding from this corner
	this.adjacent = []; //Set of corners connected by 1 edge
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = Corner;
else
    window.Corner = Corner;