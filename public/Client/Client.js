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

    _EntityManager = new EntityManager();
 	
	scene = new THREE.Scene();
 
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 2500;
 
 
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );

	_ViewManager = new ViewManager();

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

 	var BSON = bson().BSON;
 	ws.binaryType = "blob";
	document.body.appendChild( renderer.domElement );
	document.addEventListener('keydown', function(event) {
		var msg = {id: 'key_down', content: ''};
		msg.content = event.keyCode;
   		if(event.keyCode == 37 ||
   			event.keyCode == 38 ||
   			event.keyCode == 39 ||
   			event.keyCode == 40) {

   			ws.send(BSON.serialize(msg));
 
    	}
	});
 	document.addEventListener('keyup', function(event) {
		var msg = {id: 'key_up', content: ''};
		msg.content = event.keyCode;
   		if(event.keyCode == 37 ||
   			event.keyCode == 38 ||
   			event.keyCode == 39 ||
   			event.keyCode == 40) {

   			ws.send(BSON.serialize(msg));
    	}
	});
 	var client = this;
 	function onmessagedeserialized(msg)
 	{
 		//Getting entity changes from server
		if(msg.id === 'entityChanges')
		{
			var allChanges = msg.content;
			for(var i = 0; i < allChanges.length; i++)
			{
				var entitychange = new Entity();
				entitychange.setID(allChanges[i].id)
				//If the changed entity does not exist on the client, create it
				if(_EntityManager.getEntity(entitychange.id) == null)
				{
					_EntityManager.addEntity(entitychange);
				}
					//update the entity with the changed components
					var changedComponents = allChanges[i].components;
					for(var j = 0; j < changedComponents.length; j++)
					{
						if(changedComponents[j].name === 'removed')
						{
								//Remove components in the list
								for(var k = 0; k < changedComponents[j].componentList.length; k++)
								{
									delete _EntityManager.getEntity(entitychange.id).components[changedComponents[j].componentList[k].name];
								}
								changedComponents[j].componentList = [];
						}
						//If we want lag compensation for components then we need to avoid directly updating the component
						//on the client side from this code

						_EntityManager.getEntity(entitychange.id).components[changedComponents[j].name] = changedComponents[j];
					}
					
			}
		}
 	}
	ws.onmessage = function(e)
	{
		try {
        	var reader = new FileReader();
        	reader.onload  = function() {
            	var uint8Array  = new Uint8Array(this.result);
            	var msg = BSON.deserialize(uint8Array);
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
 	_ViewManager.updateAll(_EntityManager);
	renderer.render( scene, camera );
 
}

function simulate()
{
	for(var i = 0; i < _EntityManager.getEntityList(); i++)
	{
		//Do client side input and physics simulation
	}
	setTimeout(simulate,1000 / 35);
}