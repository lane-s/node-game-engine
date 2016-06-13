var defaultSize = 150;
var seedrandom = require('seedrandom');
var Voronoi = require('./rhill-voronoi-core.js');

TerrainGenerator = function(params)
{
	if(params.seed)
		this.rng = new seedrandom(params.seed);
	else
		this.rng = new seedrandom(Math.floor((Math.random() * 1000000)));

	if(params.sizeX)
		this.sizeX = params.sizeX;
	else
		this.sizeX = defaultSize;

	if(params.sizeY)
		this.sizeY = params.sizeY;
	else
		this.sizeY = defaultSize;

	if(params.siteNum)
		this.siteNum = params.siteNum;
	else
		this.siteNum = 100;

}

//Performs every step of terrain generation
TerrainGenerator.prototype.generateTerrain = function()
{
	this.randomSites();
	this.generateVoronoiPolygons();

}

//Creates voronoi polygons from the terrain generator's sites
TerrainGenerator.prototype.generateVoronoiPolygons = function()
{
	this.voronoi = new Voronoi();
	var bbox = {xl:0,xr:this.sizeX,yb:this.sizeY,yt:0};
	this.diagram = this.voronoi.compute(this.sites, bbox);
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