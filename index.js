var express = require('express');
var app = express();
var http = require('http').Server(app);
var WebSocketServer = require('ws').Server;
var port = process.env.PORT || 8080;

var tickRate = 1000/35;

app.get('/', function(req, res){
  res.sendfile('index.html');
});
app.use('/public',express.static(__dirname + '/public'));

http.listen(port, function(){
  console.log('listening on ',http.address(),':',port);
});

var wss = new WebSocketServer({server: http});

var userManager = require('./userManager');
_userManager = new userManager();

var inputHandler = require('./inputHandler');
_inputHandler = new inputHandler();

var entityManager = require('./public/entityManager');
_entityManager = new entityManager();

wss.broadcast = function(data) {
  users = _userManager.getUsers();
  for(i = 0; i < users.length; i++)
  {
    ws = users[i].getConnection();
    if(ws.readyState < 2)
    {
    users[i].getConnection().send(data);
    }
  }
};

wss.on('connection', function(ws){
  _userManager.initUser(ws, _entityManager);
  _inputHandler.handleIt(ws, _userManager);
});

var gameServer = require('./gameServer');
gameServer = new gameServer(tickRate);
gameServer.update(_entityManager,wss);
