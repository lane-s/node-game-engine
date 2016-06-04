var scene, camera, renderer;
var geometry, material, mesh;
 
init();
simulate();
animate();

function JSONtoVector3(jobject)
{
	return new THREE.Vector3(jobject.x,jobject.y,jobject.z);
}
function init() {
 
 	
 	var host = location.origin.replace(/^http/, 'ws')
    var ws = new WebSocket(host);

    _entityManager = new window.entityManager();
 	
	scene = new THREE.Scene();
 
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 1500;
 
 
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );

	_viewManager = new window.viewManager();

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

 	var BSON = bson().BSON;
 	ws.binaryType = "blob";
	document.body.appendChild( renderer.domElement );
	document.addEventListener('keydown', function(event) {
		msg = {id: 'key_down', content: ''};
		msg.content = event.keyCode;
   		if(event.keyCode == 37 ||
   			event.keyCode == 38 ||
   			event.keyCode == 39 ||
   			event.keyCode == 40) {

   			ws.send(BSON.serialize(msg));
 
    	}
	});
 	document.addEventListener('keyup', function(event) {
		msg = {id: 'key_up', content: ''};
		msg.content = event.keyCode;
   		if(event.keyCode == 37 ||
   			event.keyCode == 38 ||
   			event.keyCode == 39 ||
   			event.keyCode == 40) {

   			ws.send(BSON.serialize(msg));
    	}
	});
 	client = this;
 	function onmessagedeserialized(msg)
 	{
		if(msg.id === 'entityChanges')
		{
			allChanges = msg.content;
			for(i = 0; i < allChanges.length; i++)
			{
				changeList = allChanges[i];
				if(_entityManager.getEntity(changeList.key) == null)
				{
					if(changeList.type === 'Player')
					{
					entity = new Player();
					}else{
					entity = new Entity();
					}
					_entityManager.addEntity(entity);
					entity.setID(changeList.key);
				}
				entity = _entityManager.getEntity(changeList.key);

				entityChanges = changeList.value;
				for(j = 0; j < entityChanges.length; j++)
				{
					if(entityChanges[j].key === 'position')
					{
						
						entity.setPosition(JSONtoVector3(entityChanges[j].value));
					}else if(entityChanges[j].key === 'velocity')
					{
						entity.setVelocity(JSONtoVector3(entityChanges[j].value));
					}else if(entityChanges[j].key === 'removed')
					{
						_entityManager.removeEntity(entity.getID());
					}
				}
			}
		}
 	}
	ws.onmessage = function(e)
	{
		try {
        	var reader = new FileReader();
        	reader.onload  = function() {
            	uint8Array  = new Uint8Array(this.result);
            	msg = BSON.deserialize(uint8Array);
            	onmessagedeserialized(msg);
        	}
        	reader.readAsArrayBuffer(e.data);
    		}
    		catch(err) {
        		console.log('Failed to deserialize: ', err);
    		}
	}
}
 
function animate() {
 
	requestAnimationFrame( animate );
 	_viewManager.updateAll(_entityManager);
	renderer.render( scene, camera );
 
}

function simulate()
{
	_entityManager.updateAll();
	setTimeout(simulate,1000 / 35);
}