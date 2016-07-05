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
const DEFAULT_BASE_AMPLITUDE = 100;
const DEFAULT_HIGH_THRESHOLD = 20;
//Display debug messages by default?
const DEFAULT_DEBUG = false;

var seedrandom = require('seedrandom');
var Voronoi = require('./rhill-voronoi-core.js');
var Perlin = require('./libnoise/module/generator/perlin.js');

Biome = function(name, canBorder, weight, clumpPenalty)
{
	this.name = name; //Biome name
	this.canBorder = canBorder; //Which biomes is this biome allowed to border?
	this.weight = weight; //How likely should this biome be to appear?
	this.baseWeight = weight;
	this.clumpPenalty = clumpPenalty;

	//I'm using this system of border relationships because it's the fastest way that I can think of to determine what neighbors are allowed.
	//It's probably dumb... there should be a way to have the same runtime without defining relationships twice
}
Biome.prototype.resetWeight = function()
{
	this.weight = this.baseWeight;
}

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
	//Generate base heightmap
	this.generateBaseMap();
	//Assign biomes to polygons
	this.assignBiomes();
	//Generate biome terrain
	this.generateBiomeTerrain();
}

TerrainGenerator.prototype.getBlendedValue = function(point)
{
	
}

TerrainGenerator.prototype.generateBiomeTerrain = function()
{
	//Segments is how many times the world plane is subdivided
	var scaleX = 1/this.baseMapParams.segments;
	var scaleY = 1/this.baseMapParams.segments;

	//5 biome types each with distinct noise modules

	//Final terrain is the blended biome noise added to the base height

	//Points need to be assigned biome weights. Terrain generator needs to blend based on biomeweight/totalpointbiomeweight

	//To find point weights: 
		/*
		iterate over all edges of vornoi graph. Get cell on each side of the edge.
		Use DEFAULT_FALLOFF to determine how far into each cell that neighbors should influence each other. 
		Weight starts at 1 at the edge and then goes to 0 over the falloff distance
		*/
	//To blend based on point weights:
		/*
		For two influencing biomes:
			lerp(biome1, biome2, biome1weight/totalweight);
		For three influencing biomes:
			lerp(biome1,lerp(biome2,biome3, biome2weight/(biome2weight+biome3weight)),biome1weight/totalWeight;
		*/

	for(var y = this.baseMapParams.segments-1; y >= 0 ; y--)
	{
		for(var x = 0; x < this.baseMapParams.segments; x++)
		{

		}
	}
}

TerrainGenerator.prototype.assignBiomes = function()
{
	//Define biomes
	var ice = new Biome('ice',['forest','plains','ice','desert'],3,2.5);
	var forest = new Biome('forest',['ice','plains','volcanic','forest','desert'],0.6,0.075);
	var volcanic = new Biome('volcanic',['forest','desert','volcanic','plains'],3,2.5);
	var plains = new Biome('plains',['forest','ice','desert','plains','volcanic'],0.7,0.1);
	var desert = new Biome('desert',['plains','volcanic','desert','forest','ice'],0.5,0.1);

	var highBiomes = [ice,volcanic,forest];
	var lowBiomes = [forest,plains,desert];
	
	var biomeList = [ice,forest,volcanic,plains,desert];

	var biomeDistribution = {ice: 0, forest: 0, volcanic: 0, plains: 0, desert: 0};


    for(var i = 0; i < this.diagram.cells.length; i++)
    {   
     	var cell = this.diagram.cells[i]; 

     	//Compute average height of cell corners   	
    	var totalHeight = 0;
    	var numCorners = cell.halfedges.length;
    	for(var j = 0; j < numCorners; j++)
    	{
    		var corner = cell.halfedges[j].getEndpoint();
    		var height = -this.baseMapGenerator.getValue(corner.x/this.sizeX,corner.y/this.sizeY,0.0)*this.baseMapParams.amplitude;
    		totalHeight += height; //Should attempt to get the value from the previously generated heightmap?
    	}

    	//Determine possible biomes based on height
    	var averageHeight = totalHeight/numCorners;

    	var possibleBiomes = lowBiomes.slice(0); //Copy the array, do not reference it

    	var cellGenerationInfo = {};

    	if(averageHeight > this.highThreshold)
    	{
    		possibleBiomes = highBiomes.slice(0);
    		cellGenerationInfo.h = "HIGH";
    	}
    	else
    		cellGenerationInfo.h = "LOW";

    	//Reset weights
    	for(var j = 0; j < possibleBiomes.length; j++)
    	{
    		possibleBiomes[j].resetWeight();
    	}

    	//Eliminate biomes based on neighbors
    	neighbors = cell.getNeighborIds();
		cellGenerationInfo.n = [];
    	for(var j = 0; j < neighbors.length; j++)
    	{
    		var neighbor = this.diagram.cells[neighbors[j]];
    		for(var k = 0; k < possibleBiomes.length; k++)
    		{
    			if(neighbor.biomeType)
    			{
    				cellGenerationInfo.n.push(neighbor.biomeType.name);
    				//If neighbor biome cannot border this biome type, remove the type from possible types
    				if(neighbor.biomeType.canBorder.indexOf(possibleBiomes[k].name) == -1)
    				{
    					possibleBiomes.splice(k,1);
    					k--;
    				}else if(neighbor.biomeType.name === possibleBiomes[k].name) //Make this type less likely if neighbor has same type
    				{
    					possibleBiomes[k].weight -= possibleBiomes[k].clumpPenalty;
    					if(possibleBiomes[k].weight <= 0)
    					{
    						possibleBiomes.splice(k,1);
    						k--;
    					}
    				}
    			}
    		}
    	}
    	if(possibleBiomes.length == 0)
    		possibleBiomes = [forest];

		cellGenerationInfo.p = [];
    	for(var j = 0; j < possibleBiomes.length; j++)
    		cellGenerationInfo.p.push(possibleBiomes[j].name);

    	//Get total weight of possible biomes
    	var totalWeight = 0;
    	for(var j = 0; j < possibleBiomes.length; j++)
    	{
    		totalWeight += possibleBiomes[j].weight;
    	}

    	//Pick a number from 0 to total weight
    	var selection = this.rng()*totalWeight;

    	var maxWeight = 0;


    	for(var j = 0; j < possibleBiomes.length; j++)
    	{
    		maxWeight += possibleBiomes[j].weight;
    		//console.log("maxWeight|"+possibleBiomes[j].name+": "+maxWeight);
    		if(selection <= maxWeight)
    		{
    			cell.biomeType = possibleBiomes[j];
    			biomeDistribution[possibleBiomes[j].name] += 1;
    			cellGenerationInfo.selection = cell.biomeType.name;
    			break;
    		}
    	}

    }
    if(this.debug)
    {
    	console.log(JSON.stringify(cellGenerationInfo));
    	console.log(JSON.stringify(biomeDistribution));
    }
}

TerrainGenerator.prototype.generateBaseMap = function()
{
	this.baseMapGenerator = new Perlin(this.baseMapParams.frequency, this.baseMapParams.lacunarity, this.baseMapParams.octave_count, this.baseMapParams.persistence, this.seed, 1);
	this.baseMap = [];

	//Segments is how many times the world plane is subdivided
	var scaleX = 1/this.baseMapParams.segments;
	var scaleY = 1/this.baseMapParams.segments;

	//The noise function needs to be polled from 0 to 1. 
	//0 should be world coordinate (0,0) and 1 should be the dimension of the map.

	for(var y = this.baseMapParams.segments-1; y >= 0 ; y--)
	{
		for(var x = 0; x < this.baseMapParams.segments; x++)
		{
			//Put height values in list row by row, top to bottom
			var value = this.baseMapGenerator.getValue(x*scaleX,y*scaleY,0.0);
			this.baseMap.push(value*this.baseMapParams.amplitude*(-1));
		}
	}

	//World coordinate of segment would be ssegmentCoord*(size/segments)
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

	//Threshold of what is considered high
	if(params.highThreshold)
		this.highThreshold = params.highThreshold;
	else
		this.highThreshold = DEFAULT_HIGH_THRESHOLD;

	if(params.debug)
		this.debug = params.debug;
	else
		this.debug = DEFAULT_DEBUG;

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