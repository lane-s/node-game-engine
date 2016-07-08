//Defaults
//Voronoi/General
const DEFAULT_MAP_SIZE = 150;
const DEFAULT_SITE_NUM = 25;
const DEFAULT_RELAX_ITERATIONS = 2;
//Base Heightmap
const DEFAULT_BASE_FREQUENCY = 1.5;
const DEFAULT_BASE_LACUNARITY = 2.0;
const DEFAULT_BASE_OCTAVE_COUNT = 1;
const DEFAULT_BASE_PERSISTENCE = 0.25;
const DEFAULT_BASE_SEGMENTS = 200;
const DEFAULT_BASE_AMPLITUDE = 500;
const DEFAULT_HIGH_THRESHOLD = 0;
const DEFAULT_FALLOFF = 100; 
//Display debug messages by default?
const DEFAULT_DEBUG = true;

var seedrandom = require('seedrandom');
var Color = require('color-js');
var Voronoi = require('./rhill-voronoi-core.js');
var Perlin = require('./libnoise/module/generator/perlin.js');
var Interpolation   = require('./libnoise/interpolation.js');
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

	var highBiomes = [ice,volcanic,forest,plains];
	var lowBiomes = [forest,plains,desert];
	
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
function pointDistance(a,b)
{
	return Math.sqrt(Math.pow(a.y-b.y,2)+Math.pow(a.x-b.x,2));
}

function addPoints(a,b)
{
	return {x: a.x+b.x, y: a.y+b.y };
}

//this.baseMap is an array of points with corresponding height, biome weights, and color based on biome type
TerrainGenerator = function(params)
{
	this.setDefaults(params);
}

//Performs every step of terrain generation (not in constructor in case you want to render at different steps)
TerrainGenerator.prototype.generateTerrain = function()
{
	//Yes, i know this system of debug messages is stupid. There should be some debug object that can debug.log(msg) and only prints to the console when enabled

	if(this.debug)
		console.log("Generating random sites");
	//Generate random sites
	this.randomSites();

	if(this.debug)
		console.log("Generating voronoi cells from random sites");
	//Generate voronoi polygons and perform Lloyd relaxation
	this.generateVoronoiPolygons();

	if(this.debug)
		console.log("Generating base grid");
	//Generate base heightmap
	this.generateBaseMap();

	if(this.debug)
		console.log("Assigning biome types to cells");
	//Assign biomes to polygons
	this.assignBiomes();

	//Creates individual terrain generators for each biome type
	if(this.debug)
		console.log("Creating biome generators");

	this.createBiomeGenerators();

	if(this.debug)
		console.log("Filling grid with biome types");
	//Fills grid points with biome weights
	this.fillBiomes();

	if(this.debug)
		console.log("Generating biome features");
	//Generate biome terrain
	this.generateBiomeTerrain();
}

//Recursive function for blending between biomes
//Blend between color in same way for debug visuals (future use for terrain texture?)
TerrainGenerator.prototype.getBlendedValue = function(point)
{

	if(point.biomeWeights.length > 1)
	{
		var alpha = point.biomeWeights[1].weight/(point.biomeWeights[0].weight+point.biomeWeights[1].weight);

		//console.log(point.biomeWeights[0].combinedValue+"->"+point.biomeWeights[1].combinedValue + "| "+alpha);

		point.biomeWeights[0].combinedValue = Interpolation.linear(
			point.biomeWeights[0].combinedValue,
			point.biomeWeights[1].combinedValue,
			alpha
			);
		point.biomeWeights[0].weight += point.biomeWeights[1].weight;
		point.biomeWeights.splice(1,1);
	
		//console.log(point.biomeWeights[0].combinedValue);

		return this.getBlendedValue(point);

	}else if(point.biomeWeights.length > 0){
		point.color = point.biomeWeights[0].color;
		return point.biomeWeights[0].combinedValue;
	}else{
		point.color = new Color('#FF0000');
		if(this.debug)
			console.log("Error: biome not assigned at point: "+JSON.stringify(point));
		return 0;
	}
}


TerrainGenerator.prototype.createBiomeGenerators = function()
{
	this.biomeGenerators = {};

	//Plains
	var plainsBase = new Perlin(this.baseMapParams.frequency, 2.25, 6, 0.35, this.seed, 1);
	//Desert
	var desertBase = new Perlin(this.baseMapParams.frequency, 2.1, 3, 0.3, this.seed, 1);
	//Forest
	var forestBase = new Perlin(this.baseMapParams.frequency, 2.0, 6, 0.5, this.seed, 1);

	this.biomeGenerators.ice = this.baseMapGenerator;
	this.biomeGenerators.volcanic = this.baseMapGenerator;
	this.biomeGenerators.plains = plainsBase;
	this.biomeGenerators.forest = forestBase;
	this.biomeGenerators.desert = desertBase;
}

//point callbacks for scanline algorithm
function biomeFill(polygon, xCoord, yCoord,params)
{
	if(params.terrainGen && params.biomeType)
	{
		var terrainGen = params.terrainGen;
		if(xCoord >= 0 && yCoord >= 0 && xCoord < terrainGen.baseMapParams.segments && yCoord < terrainGen.baseMapParams.segments)
		{
			var foundWeight = false;
			var index = terrainGen.coordToIndex(xCoord,yCoord);

			for(var j = 0; j < terrainGen.baseMap[index].biomeWeights.length; j++)
			{
				if(terrainGen.baseMap[index].biomeWeights[j].name === params.biomeType.name)
					foundWeight = true;
			}

			if(!foundWeight)
			{
				var weightInfo = {name: params.biomeType.name, weight: 1, combinedValue: terrainGen.biomeGenerators[params.biomeType.name].getValue(xCoord*terrainGen.scaleX,yCoord*terrainGen.scaleY,0), color: Color(colorTable[params.biomeType.name])};
				terrainGen.baseMap[index].biomeWeights.push(weightInfo);
			}
		}
	}else{
		console.log("Incorrect parameters for point callback");
	}
}

function gradientBiomeFill(polygon, xCoord, yCoord, params)
{
	if(params.terrainGen && params.biomeType)
	{
		var terrainGen = params.terrainGen;

		var foundWeight = false;
		var index = terrainGen.coordToIndex(xCoord,yCoord);

		if(xCoord >= 0 && yCoord >= 0 && xCoord < terrainGen.baseMapParams.segments && yCoord < terrainGen.baseMapParams.segments)
		{

			for(var j = 0; j < terrainGen.baseMap[index].biomeWeights.length; j++)
			{
				if(terrainGen.baseMap[index].biomeWeights[j].name === params.biomeType.name)
					foundWeight = true;
			}

			if(!foundWeight)
			{
				var biomeWeight = 0;
				if(params.innerEdge)
				{
					var innerEdge = params.innerEdge;
					var point = {x: xCoord*terrainGen.coordToWorldX, y: yCoord*terrainGen.coordToWorldY};
					var distance = Math.abs((innerEdge.b.y-innerEdge.a.y)*point.x-(innerEdge.b.x-innerEdge.a.x)*point.y+innerEdge.b.x*innerEdge.a.y-innerEdge.b.y*innerEdge.a.x)/pointDistance(innerEdge.a,innerEdge.b);
					biomeWeight = 1-distance/terrainGen.falloff;
				}

				var weightInfo = {name: params.biomeType.name, weight: biomeWeight, combinedValue: terrainGen.biomeGenerators[params.biomeType.name].getValue(xCoord*terrainGen.scaleX,yCoord*terrainGen.scaleY,0), color: Color(colorTable[params.biomeType.name])};
				terrainGen.baseMap[index].biomeWeights.push(weightInfo);
			}
		}
	}
}

//Calls pointCallback on every point within the polygon
TerrainGenerator.prototype.scanLine = function(polygon, pointCallback, callbackParams)
{
	var yMin = this.sizeY;
	var yMax = 0;

	//Determine minimum and maximum y points
	for(var j = 0; j < polygon.edges.length; j++)
	{
		//Go DEFAULT_FALLOFF out from each biome edge and add weight from this biome from 1 to 0
		yMin = Math.min(polygon.edges[j].a.y,yMin);
		yMax = Math.max(polygon.edges[j].a.y,yMax);
	}

	yMinCoord = Math.floor((yMin/this.sizeY)*this.baseMapParams.segments);
	yMaxCoord = Math.floor((yMax/this.sizeY)*this.baseMapParams.segments);

	for(var yCoord = yMinCoord; yCoord <= yMaxCoord; yCoord++)
	{
		var intersections = [];
		//Get intersection points for the horizontal line at this y coordinate
		for(var j = 0; j < polygon.edges.length; j++)
		{
			edgeMaxY = Math.max(polygon.edges[j].a.y,polygon.edges[j].b.y);
			edgeMinY = Math.min(polygon.edges[j].a.y,polygon.edges[j].b.y);

			if(yCoord*this.coordToWorldY >= edgeMinY && yCoord*this.coordToWorldY < edgeMaxY)
			{
				var slope,xCoord;
				if(polygon.edges[j].a.x-polygon.edges[j].b.x != 0)
				{
				slope = (polygon.edges[j].a.y-polygon.edges[j].b.y)/(polygon.edges[j].a.x-polygon.edges[j].b.x);
				var yintercept = polygon.edges[j].a.y - slope*polygon.edges[j].a.x;
				xCoord = Math.floor(((yCoord*this.coordToWorldY-yintercept)/slope)/this.sizeX*this.baseMapParams.segments);
				}else{
					xCoord = polygon.edges[j].a.x/this.sizeX*this.baseMapParams.segments;
				}

				intersections.push(xCoord);
			}
		}

		//Sort intersection points by x value
		var sortedIntersections = intersections.sort(function(a,b){
			return a-b;
		});

		//Callback on points in between
		if(sortedIntersections.length > 1)
		{
			for(var j = 0; (j+1) < sortedIntersections.length; j+=2)
			{
				for(var xCoord = sortedIntersections[j]; xCoord < sortedIntersections[j+1]; xCoord++)
				{
					pointCallback(polygon,xCoord,yCoord, callbackParams);
				}
			}
		}

	}

}


TerrainGenerator.prototype.fillBiomes = function()
{
	for(var i = 0; i < this.diagram.cells.length; i++)
	{
		var cell = this.diagram.cells[i];
		var polygon = new Polygon();
		polygon.cellToPolygon(cell);

		var callbackParams = {terrainGen: this, biomeType: cell.biomeType};

		this.scanLine(polygon, biomeFill, callbackParams);
	}

	for(var i = 0; i < this.diagram.cells.length; i++)
	{
		var cell = this.diagram.cells[i];

			//For each edge of the polygon
		for(var j = 0; j < cell.halfedges.length; j++)
		{

			//Create a rectangle based on the cell edge and falloff distance
			var cellEdge = {a:cell.halfedges[j].getStartpoint(),b:cell.halfedges[j].getEndpoint()};
			callbackParams = {terrainGen: this, biomeType: cell.biomeType, innerEdge: cellEdge};

			var rectangleEdges = [cellEdge];

			var edgeNormal = new THREE.Vector2(cellEdge.a.y-cellEdge.b.y,cellEdge.b.x-cellEdge.a.x);
			edgeNormal.normalize();

			var pointA = {x: cellEdge.a.x, y: cellEdge.a.y};
			var pointB = {x: cellEdge.b.x, y: cellEdge.b.y};

			var testPoint = addPoints(pointA, edgeNormal);

			var normalDirection = 1;
			if(pointDistance(testPoint,cell.site) < pointDistance(pointA, cell.site))
				normalDirection = -1;

			edgeNormal.multiplyScalar(normalDirection*this.falloff);

			var rectangle = new Polygon([
				cellEdge, //inner edge
				{a: cellEdge.a, b: addPoints(cellEdge.a,edgeNormal)},
				{a: cellEdge.b, b: addPoints(cellEdge.b,edgeNormal)},
				{a: addPoints(cellEdge.a,edgeNormal), b: addPoints(cellEdge.b,edgeNormal)}
			]);
			//Fill new polygon with weights based on distance from inner edge
			this.scanLine(rectangle, gradientBiomeFill, callbackParams);
		}
	}
}

TerrainGenerator.prototype.generateBiomeTerrain = function()
{
	//Set the heightmap value to the blended value of all biomes at the point
	for(var i = 0; i < this.baseMap.length; i++)
	{
		this.baseMap[i].height = this.getBlendedValue(this.baseMap[i]);
		this.baseMap[i].height *= this.baseMapParams.amplitude*(-1); //Invert and multiply by amplitude
		//!! Should each generator have it's own amplitude?
	}
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
TerrainGenerator.prototype.coordToIndex = function(x,y)
{

	return x+this.baseMapParams.segments*(this.baseMapParams.segments-1-y);
}

TerrainGenerator.prototype.generateBaseMap = function()
{
	this.baseMapGenerator = new Perlin(this.baseMapParams.frequency, this.baseMapParams.lacunarity, this.baseMapParams.octave_count, this.baseMapParams.persistence, this.seed, 1);
	this.baseMap = [];

	//The noise function needs to be polled from 0 to 1. 
	//0 should be world coordinate (0,0) and 1 should be the dimension of the map.

	for(var y = this.baseMapParams.segments-1; y >= 0 ; y--)
	{
		for(var x = 0; x < this.baseMapParams.segments; x++)
		{
			//Put height values in list row by row, top to bottom
			var value = this.baseMapGenerator.getValue(x*this.scaleX,y*this.scaleY,0.0);
			var point = {x: x*this.scaleX, y: y*this.scaleY, height: value, biomeWeights:[] };
			this.baseMap.push(point);
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

	if(params.falloff)
		this.falloff = params.falloff;
	else
		this.falloff = DEFAULT_FALLOFF;

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

	//Multiply by scale to go from local coordinates to world %
	//i.e. with a 200 segment world, coordinate 100 is .5 (50%)
	this.scaleX = 1/this.baseMapParams.segments;
	this.scaleY = 1/this.baseMapParams.segments;

	//Multiply this to go from local coordinates to world coordinates
	this.coordToWorldY = this.sizeY*this.scaleY;
	this.coordToWorldX = this.sizeX*this.scaleX;
}

module.exports = TerrainGenerator;