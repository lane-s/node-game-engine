//Defaults
//Voronoi/General
const DEFAULT_MAP_SIZE = 150;
const DEFAULT_SITE_NUM = 25;
const DEFAULT_RELAX_ITERATIONS = 2;

var seedrandom = require('seedrandom');
var Color = require('color-js');
var Voronoi = require('./rhill-voronoi-core.js');
var THREE = require('three');


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

	//Define biomes
	var ice = new Biome('ice',['forest','plains','ice'],4,3.75);
	var forest = new Biome('forest',['ice','plains','volcanic','forest','desert'],0.6,0.075);
	var volcanic = new Biome('volcanic',['forest','desert','volcanic','plains'],3,2.75);
	var plains = new Biome('plains',['forest','ice','desert','plains','volcanic'],0.6,0.075);
	var desert = new Biome('desert',['plains','volcanic','desert','forest'],0.5,0.1);
	
	var biomeList = [ice,forest,volcanic,plains,desert];

	var colorTable = {
    	ice: '#E6FFFF',
    	volcanic: '#1F1F14',
    	forest: '#006600',
    	plains: '#2FB62F',
    	desert: '#FFCC66'
    }

Biome.prototype.resetWeight = function()
{
	this.weight = this.baseWeight;
}


//this.baseMap is an array of points with corresponding height, biome weights, and color based on biome type
TerrainGenerator = function(params)
{
	this.setDefaults(params);
}

//Performs every step of terrain generation (not in constructor in case you want to render at different steps)
TerrainGenerator.prototype.generateTerrain = function()
{

}


TerrainGenerator.prototype.assignBiomes = function()
{

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

}

module.exports = TerrainGenerator;