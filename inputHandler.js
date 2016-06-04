var bson = require("bson");
var BSON = new bson.BSONPure.BSON();
var FileReader = require('FileReader');
function inputHandler()
{

}

inputHandler.prototype.handleIt = function(ws, manager)
{
	function onmessagedeserialized(msg)
	{
		player = manager.getUserByConnection(ws).getPlayer();
		inputState = player.getInputState();

		if(msg.id === 'key_down')
		{
			keyCode = msg.content;

			if(keyCode == 37)
			{
				inputState.setLeft(1);
			}
			else if(keyCode == 39)
			{
				inputState.setRight(1);
			}else if(keyCode == 38)
			{
				inputState.setUp(1);
			}else if(keyCode == 40)
			{
				inputState.setDown(1);
			}
		}else if(msg.id === 'key_up')
		{
			keyCode = msg.content;
			
			if(keyCode == 37)
			{
				inputState.setLeft(0);
			}
			else if(keyCode == 39)
			{
				inputState.setRight(0);
			}else if(keyCode == 38)
			{
				inputState.setUp(0);
			}else if(keyCode == 40)
			{
				inputState.setDown(0);
			}
		}
		
		player.setInputState(inputState);
	}
	ws.onmessage = function(e){
            msg = BSON.deserialize(e.data);
            onmessagedeserialized(msg);
	}

}

module.exports = inputHandler;