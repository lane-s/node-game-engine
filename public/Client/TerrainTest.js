var scene, camera, renderer, controls;
var THREE = require('three');
var TerrainGenerator = require('../TerrainGen/TerrainGenerator');
var OrbitControls = require('three-orbit-controls')(THREE);
var Color = require('color-js');

init();
animate();

function init()
{
	scene = new THREE.Scene();
 
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );

	const size = 6000;
	const segs = 600;

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

	//Reference box
	var boxgeometry = new THREE.BoxGeometry( 10, 10, 10 );
	var boxmaterial = new THREE.MeshStandardMaterial( { color: 0x0000ff, wireframe: false } );
 	var boxmesh = new THREE.Mesh( boxgeometry, boxmaterial);
 	scene.add(boxmesh);
 	boxmesh.position.set(size/2,size/2,50);
 	boxmesh.castShadow = true;


				// LIGHTS

				hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
				hemiLight.color.setHSL( 0.6, 1, 0.6 );
				hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
				hemiLight.position.set( size/2, size/2, 0 );
				scene.add( hemiLight );

				//

				dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
				dirLight.color.setHSL( 0.1, 1, 0.95 );
				dirLight.position.set( 0, 0, 1 );
				dirLight.position.multiplyScalar( 50 );
				scene.add( dirLight );

				dirLight.castShadow = true;

				dirLight.shadowMapWidth = 2048;
				dirLight.shadowMapHeight = 2048;

				var d = 50;

				dirLight.shadowCameraLeft = -d;
				dirLight.shadowCameraRight = d;
				dirLight.shadowCameraTop = d;
				dirLight.shadowCameraBottom = -d;
				dirLight.shadowCameraVisible = true;

				dirLight.shadowCameraFar = 3500;
				dirLight.shadowBias = -0.0001;


	//Create terrain generator
	var terrain = new TerrainGenerator({
		sizeX: size,
		sizeY: size,
		seed: 20,
		baseMapParams: {
			segments: segs
		}
	});

	var colorTable = {
    	ice: 0x0000ff,
    	volcanic: 0xff3300,
    	forest: 0x006600,
    	plains: 0xcc9900,
    	desert: 0xffcc66

    }

	//Fully generate terrain
	terrain.generateTerrain();

	var geometry = new THREE.PlaneGeometry(size, size, segs-1, segs-1);

	var material = new THREE.MeshStandardMaterial({
    	vertexColors: THREE.VertexColors,
    	metalness: 0.05,
    	roughness: 0.6,
    	wireframe: false
	});

	for(var i = 0; i < geometry.faces.length; i++)
	{
		var aColor = new THREE.Color(terrain.baseMap[geometry.faces[i].a].color.toString());
		var bColor = new THREE.Color(terrain.baseMap[geometry.faces[i].b].color.toString());
		var cColor = new THREE.Color(terrain.baseMap[geometry.faces[i].c].color.toString());

		var vertexColors = [
		aColor,bColor,cColor
		]

		geometry.faces[i].vertexColors = vertexColors;
	}

	//Render plane for base heightmap
	for(var i = 0; i < terrain.baseMap.length; i++)
	{
		geometry.vertices[i].z = terrain.baseMap[i].height;
	}
	geometry.computeVertexNormals();

	var terrainMesh = new THREE.Mesh(geometry,material);
	scene.add(terrainMesh);
	terrainMesh.recieveShadow = true;
	terrainMesh.castShadow = true;
	terrainMesh.position.set(size/2,size/2,0);

	geometry = new THREE.Geometry();
	material = new THREE.PointsMaterial({
		size: 1.0,
		color: 0x0000ff,
	});

	/*
	//Render points for random sites
	for(var i = 0; i < terrain.siteNum; i++)
	{
		var x = terrain.sites[i].x;
		var y = terrain.sites[i].y;
		geometry.vertices.push(new THREE.Vector3(x,y,150));
	}

	var points = new THREE.Points(geometry,material);
	scene.add(points);*/

	//Render lines for polygon edges
    var va,vb,v1,v2,vStart;

    /*
    for(var i = 0; i < terrain.diagram.cells.length; i++)
    {
    	geometry = new THREE.Geometry();
    	material = new THREE.LineBasicMaterial({
        	color: colorTable[terrain.diagram.cells[i].biomeType.name],
        	linewidth: 3
   		 });

    	for(var j = 0; j < terrain.diagram.cells[i].halfedges.length; j++)
    	{
    		var endpoint = terrain.diagram.cells[i].halfedges[j].getEndpoint();
    		v = new THREE.Vector3(endpoint.x,endpoint.y,150);
    		geometry.vertices.push(v);
    		if( j == 0)
    		{
    			vStart = v;
    		}
    	}
    	geometry.vertices.push(vStart);
    	var line = new THREE.Line(geometry,material);
    	scene.add(line);
    }*/

}

function animate() {
 
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
 
}