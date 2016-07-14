//Polygon object for a simpler object to manipulate than a voronoi cell
Polygon = function(edges)
{
	this.edges = edges || [];
}
//Converts voronoi cell to polygon object
Polygon.prototype.cellToPolygon = function(cell)
{
	for(var j = 0; j < cell.halfedges.length; j++)
	{
		this.edges.push({a: cell.halfedges[j].getStartpoint() ,b: cell.halfedges[j].getEndpoint()});
	}
	this.site = cell.site;
}
//Distance between points
Polygon.prototype.pointDistance(a,b)
{
	return Math.sqrt(Math.pow(a.y-b.y,2)+Math.pow(a.x-b.x,2));
}

Polygon.prototype.addPoints(a,b)
{
	return {x: a.x+b.x, y: a.y+b.y };
}