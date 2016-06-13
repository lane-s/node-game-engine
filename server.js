var express = require('express');
var app = express();
var http = require('http').Server(app);
var WebSocketServer = require('ws').Server;
var port = process.env.PORT || 8080;

//Update the server every 'tickRate' seconds
var tickRate = 1000/35;

app.get('/', function(req, res){
  res.sendfile('index.html');
});
app.use('/public',express.static(__dirname + '/public'));

var wss = new WebSocketServer({server: http});

var UserManager = require('./UserManager');
_UserManager = new UserManager();

var InputHandler = require('./InputHandler');
_InputHandler = new InputHandler();

var EntityManager = require('./public/EntityManager');
_EntityManager = new EntityManager();

//Send data to every user
wss.broadcast = function(data) {
  users = _UserManager.getUsers();
  for(i = 0; i < users.length; i++)
  {
    ws = _UserManager.getUserByID(users[i]).getConnection();
    if(ws.readyState < 2)
    {
    ws.send(data);
    }
  }
};

//When a user connects, create the user and set up the proper callbacks for every event
wss.on('connection', function(ws){
  _UserManager.initUser(ws, _EntityManager); //Creates the user and handles disconnect callback
  _InputHandler.handleIt(ws, _UserManager); //Handles callback for input messages
});

//Create gameServer object to run game logic every tick
var _GameServer = require('./GameServer');
_GameServer = new GameServer(tickRate);

//Initialize server
_GameServer.init(_EntityManager);

//Begin listening for connections
http.listen(port, function(){
  console.log('listening on ',http.address(),':',port);
});

_GameServer.update(_UserManager, _EntityManager,wss);
