var scene, camera, renderer;
var THREE = require('three');
var TerrainGenerator = require('../TerrainGen/TerrainGenerator');

init();
animate();

function init()
{
	scene = new THREE.Scene();
 
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 155;
	camera.position.x = 75;
	camera.position.y = 75;
 
 
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );

	//Dynamically resize game window
	 window.addEventListener( 'resize', onWindowResize, false );

	function onWindowResize(){

    	camera.aspect = window.innerWidth / window.innerHeight;
    	camera.updateProjectionMatrix();

    	renderer.setSize( window.innerWidth, window.innerHeight );

	}

	//Hide scrollbars
	document.documentElement.style.overflow = 'hidden';
	document.body.scroll = "no";
	//No margins
	document.getElementsByTagName("body")[0].style.marginLeft = 0;
	document.getElementsByTagName("body")[0].style.marginTop = 0;

	//Add renderer to dom
	document.body.appendChild( renderer.domElement );

	//Create random points
	var geometry = new THREE.Geometry();

	var material = new THREE.PointsMaterial({
		size: 1.0,
		color: 0x0000ff,
	});

	var terrain = new TerrainGenerator({sizeX: 100,
		sizeY: 100,
		seed: 1});

	terrain.generateTerrain();

	//Render points for random sites
	for(var i = 0; i < terrain.siteNum; i++)
	{
		var x = terrain.sites[i].x;
		var y = terrain.sites[i].y;
		console.log(x+","+y);
		geometry.vertices.push(new THREE.Vector3(x,y,0));
	}

	var points = new THREE.Points(geometry,material);
	scene.add(points);

	//Render lines for polygon edges
    var va,vb,v1,v2,vStart;

    for(var i = 0; i < terrain.diagram.cells.length; i++)
    {
    	geometry = new THREE.Geometry();
    	material = new THREE.LineBasicMaterial({
        	color: 0x0000ff
   		 });
    	for(var j = 0; j < terrain.diagram.cells[i].halfedges.length; j++)
    	{
    		if( j == 0)
    		{
    			va = terrain.diagram.cells[i].halfedges[j].getStartpoint();
    			v1 = new THREE.Vector3(va.x,va.y,0);
    			geometry.vertices.push(v1);
    			vStart = v1;
    		}

    		vb = terrain.diagram.cells[i].halfedges[j].getEndpoint();
    		v2 = new THREE.Vector3(vb.x,vb.y,0);
    		geometry.vertices.push(v2);
    	}
    	geometry.vertices.push(vStart);
    	var line = new THREE.Line(geometry,material);
    	scene.add(line);
    }
}

function animate() {
 
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
 
}