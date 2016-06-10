var defaultSize = 150;
var seedrandom;

if (typeof require !== 'undefined' )
{
	seedrandom = require('seedrandom');

}else{
	seedrandom = Math.seedrandom;
}

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


}

TerrainGenerator.prototype.generateVoronoiPolygons = function()
{

}

TerrainGenerator.prototype.randomSites = function()
{

}