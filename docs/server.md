#server.js

This is what node runs to start the server. 

All of the neccessary initialization for the server is performed here.

[UserManager](UserManager.md) sets up callbacks for users connecting and disconnecting.

[InputHandle](InputHandler.md) sets up callbacks for input messages in the `handleIt` function.

After all of the event callbacks are set up, the [GameServer](GameServer.md) `update` function starts doing game logic.