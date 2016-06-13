var defaultSize = 150;
var seedrandom = require('seedrandom');
var Voronoi = require('./rhill-voronoi-core.js');

TerrainGenerator = function(params)
{
	//Seed for random number generation
	if(params.seed)
		this.rng = new seedrandom(params.seed);
	else
		this.rng = new seedrandom(Math.floor((Math.random() * 1000000)));

	//Dimensions of the map
	if(params.sizeX)
		this.sizeX = params.sizeX;
	else
		this.sizeX = defaultSize;

	if(params.sizeY)
		this.sizeY = params.sizeY;
	else
		this.sizeY = defaultSize;

	//Number of sites to use for polygon generation
	if(params.siteNum)
		this.siteNum = params.siteNum;
	else
		this.siteNum = 100;

	//Number of times to perform Lloyd relaxation
	if(params.relaxIterations)
		this.relaxIterations = params.relaxIterations;
	else
		this.relaxIterations = 2;


}

//Performs every step of terrain generation
TerrainGenerator.prototype.generateTerrain = function()
{
	//Generate random sites
	this.randomSites();
	//Generate voronoi polygons and perform Lloyd relaxation
	this.generateVoronoiPolygons();
	//Generate base heightmap and mark polygon region type based on elevation

}

//Creates voronoi polygons from the terrain generator's sites
TerrainGenerator.prototype.generateVoronoiPolygons = function()
{
	//Generate initial polygons
	this.voronoi = new Voronoi();
	var bbox = {xl:0,xr:this.sizeX,yb:this.sizeY,yt:0};
	this.diagram = this.voronoi.compute(this.sites, bbox);

	//Perform Lloyd relaxtion
	for(var i = 0; i < this.relaxIterations; i++)
	{
		this.relaxSites();
		this.voronoi.recycle(this.diagram);
		this.diagram = this.voronoi.compute(this.sites, bbox);
	}
}

//Performs Lloyd relaxation on random sites
TerrainGenerator.prototype.relaxSites = function()
{
	var cells = this.diagram.cells;
	var newSites = [];
	for(var i = 0; i < cells.length; i++)
	{
		newSites.push(this.getCentroid(cells[i]));
	}

	this.sites = newSites;
	this.siteNum = this.sites.length;
}

//Returns the approximate centroid of a voronoi cell (simply averaging corners)
TerrainGenerator.prototype.getCentroid = function(cell)
{
	var centroid = {x: 0, y: 0};
	var numVerts = cell.halfedges.length;
	for(var i = 0; i < numVerts; i++)
	{
		var v = cell.halfedges[i].getStartpoint();
		centroid.x += v.x;
		centroid.y += v.y;
	}
	centroid.x /= numVerts;
	centroid.y /= numVerts;

	return centroid;
}

//Sets the sites property of the terrain generator to a list of random sites (points)
//Params- sizeX,sizeY- size of the point field
//numSites- number of points in the field
TerrainGenerator.prototype.randomSites = function()
{
	var sites = [];
	for(var i = 0; i < this.siteNum; i++)
	{
		var point = {x: Math.round(this.rng()*this.sizeX),
		 y: Math.round(this.rng()*this.sizeY)};
		 sites.push(point);
	}
	this.sites = sites;
}

module.exports = TerrainGenerator;