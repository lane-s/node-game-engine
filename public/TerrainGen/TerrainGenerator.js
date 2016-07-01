//Defaults
//Voronoi/General
const DEFAULT_MAP_SIZE = 150;
const DEFAULT_SITE_NUM = 110;
const DEFAULT_RELAX_ITERATIONS = 2;
//Base Heightmap
const DEFAULT_BASE_FREQUENCY = 1.5;
const DEFAULT_BASE_LACUNARITY = 2.0;
const DEFAULT_BASE_OCTAVE_COUNT = 6;
const DEFAULT_BASE_PERSISTENCE = 0.25;
const DEFAULT_BASE_SEGMENTS = 200;
const DEFAULT_BASE_AMPLITUDE = 200;

var seedrandom = require('seedrandom');
var Voronoi = require('./rhill-voronoi-core.js');
var Perlin = require('./libnoise/module/generator/perlin.js');

TerrainGenerator = function(params)
{
	this.setDefaults(params);
}

//Performs every step of terrain generation (not in constructor in case you want to render at different steps)
TerrainGenerator.prototype.generateTerrain = function()
{
	//Generate random sites
	this.randomSites();
	//Generate voronoi polygons and perform Lloyd relaxation
	this.generateVoronoiPolygons();
	//Generate base heightmap and mark polygon region type based on elevation
	this.generateBaseMap();

}

TerrainGenerator.prototype.generateBaseMap = function()
{
	var baseMapGenerator = new Perlin(this.baseMapParams.frequency, this.baseMapParams.lacunarity, this.baseMapParams.octave_count, this.baseMapParams.persistence, this.seed, 1);
	this.baseMap = [];
	var scaleX = 1/this.baseMapParams.segments;
	var scaleY = 1/this.baseMapParams.segments;


	for(var y = this.baseMapParams.segments-1; y >= 0 ; y--)
	{
		for(var x = 0; x < this.baseMapParams.segments; x++)
		{
			//Put height values in list row by row, top to bottom
			var value = baseMapGenerator.getValue(x*scaleX,y*scaleY,0.0);
			this.baseMap.push(value*this.baseMapParams.amplitude);
		}
	}
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

TerrainGenerator.prototype.setDefaults = function(params)
{
	//Seed for random number generation
	if(params.seed)
		this.seed = params.seed;
	else
		this.seed = Math.floor((Math.random() * 1000000));

	this.rng = new seedrandom(this.seed);

	//Dimensions of the map
	if(params.sizeX)
		this.sizeX = params.sizeX;
	else
		this.sizeX = DEFAULT_MAP_SIZE;

	if(params.sizeY)
		this.sizeY = params.sizeY;
	else
		this.sizeY = DEFAULT_MAP_SIZE;

	//Number of sites to use for polygon generation
	if(params.siteNum)
		this.siteNum = params.siteNum;
	else
		this.siteNum = DEFAULT_SITE_NUM;

	//Number of times to perform Lloyd relaxation
	if(params.relaxIterations)
		this.relaxIterations = params.relaxIterations;
	else
		this.relaxIterations = DEFAULT_RELAX_ITERATIONS;

	//Generation parameters for the base map
	if(params.baseMapParams)
	{
		this.baseMapParams = params.baseMapParams;
	}else{
		this.baseMapParams = {};
	}

	if(!this.baseMapParams.frequency)
		this.baseMapParams.frequency = DEFAULT_BASE_FREQUENCY;

	if(!this.baseMapParams.lacunarity)
		this.baseMapParams.lacunarity = DEFAULT_BASE_LACUNARITY;

	if(!this.baseMapParams.octave_count)
		this.baseMapParams.octave_count = DEFAULT_BASE_OCTAVE_COUNT;
	
	if(!this.baseMapParams.persistence)
		this.baseMapParams.persistence = DEFAULT_BASE_PERSISTENCE;

	if(!this.baseMapParams.segments)
		this.baseMapParams.segments = DEFAULT_BASE_SEGMENTS;

	if(!this.baseMapParams.amplitude)
		this.baseMapParams.amplitude = DEFAULT_BASE_AMPLITUDE;

}

module.exports = TerrainGenerator;