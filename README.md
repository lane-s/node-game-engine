# node-game-engine

Multiplayer game engine using node.js, websockets, and three.js

## Getting started

To get this running, first clone the repository to your machine

Get the node console running in the node-game-engine directory

Run `npm install`

Run the server with `npm start` or `node server.js`

Connect to the server by opening localhost:8080 in your browser
(Or connect to the local ip of the server on port 8080 from a different machine on the local network)

## Docs

Game design documentation can be viewed [here]()

Code documentation in *italics* has not been implemented yet.

The engine uses the [Entity-Component-System](docs/Entity-Component-System.md) design pattern to handle most of the game's functionality.

The layer above this design pattern consists of:

[server.js](docs/server.md)- the main file for project 

[UserManager](docs/UserManager.md)- handles users connecting and disconnecting

[InputHandler](docs/InputHandler.md)- handles input being sent to the server from users

[GameServer](docs/GameServer.md)- runs all the systems required on the server and sends the client the neccessary changes to the game state.
