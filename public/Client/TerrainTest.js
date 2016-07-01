var scene, camera, renderer, controls;
var THREE = require('three');
var TerrainGenerator = require('../TerrainGen/TerrainGenerator');
var OrbitControls = require('three-orbit-controls')(THREE);

init();
animate();

function init()
{
	scene = new THREE.Scene();
 
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );

	const size = 2000;
	const segs = 200;

	camera.position.set(size/2,size/2,200);

	controls = new OrbitControls(camera);
 
 
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


	//Create terrain generator
	var terrain = new TerrainGenerator({
		sizeX: size,
		sizeY: size,
		seed: 2,
		baseMapParams: {
			segments: segs
		}
	});

	//Fully generate terrain
	terrain.generateTerrain();

	var geometry = new THREE.PlaneGeometry(size, size, segs-1, segs-1);

	var material = new THREE.MeshBasicMaterial({
    	color: 0xffffff,
    	wireframe: true
	});

	//Render plane for base heightmap
	for(var i = 0; i < terrain.baseMap.length; i++)
	{
		geometry.vertices[i].z = terrain.baseMap[i];
	}
	var terrainMesh = new THREE.Mesh(geometry,material);
	scene.add(terrainMesh);
	terrainMesh.position.set(size/2,size/2,0);

	geometry = new THREE.Geometry();
	material = new THREE.PointsMaterial({
		size: 1.0,
		color: 0x0000ff,
	});

	//Render points for random sites
	for(var i = 0; i < terrain.siteNum; i++)
	{
		var x = terrain.sites[i].x;
		var y = terrain.sites[i].y;
		geometry.vertices.push(new THREE.Vector3(x,y,1));
	}

	var points = new THREE.Points(geometry,material);
	scene.add(points);

	//Render lines for polygon edges
    var va,vb,v1,v2,vStart;

    geometry = new THREE.Geometry();
    material = new THREE.LineBasicMaterial({
        	color: 0x0000ff
   		 });

    for(var i = 0; i < terrain.diagram.cells.length; i++)
    {
    	geometry = new THREE.Geometry();
    	for(var j = 0; j < terrain.diagram.cells[i].halfedges.length; j++)
    	{
    		endpoint = terrain.diagram.cells[i].halfedges[j].getEndpoint();
    		v = new THREE.Vector3(endpoint.x,endpoint.y,1);
    		geometry.vertices.push(v);
    		if( j == 0)
    		{
    			vStart = v;
    		}
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