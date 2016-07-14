Edge = function()
{
	//Polygons centers connected by triangulation
	this.d0;
	this.d1;

	//Polygon corners connected by polygon edge
	this.v0;
	this.v1;
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = Edge;
else
    window.Edge = Edge;