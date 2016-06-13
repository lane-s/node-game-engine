#UserManager

This class has containers to hold all of the [User](User.md) objects required for the game.

`userList` is a list of user ids

`userTable` is a table that allows a user to be access based on its id

Both of these are used because in some cases all users need to be iterated over while in other cases a user needs to be accessed quickly by id.

The `initUser` function gets a free id for a new user and creates the user with the socket and the id. It then calls a number of functions

	`sendGameState` is called to send the connected user the state of the world when they connected (since only the changes are sent subsequenty).

	`createStartingEntities` is called to create the entities associated with a user connecting. In this case it's a hero character.

The user id is added to the list and the user is added the table.

Finally, the disconnect callback is set up.

	`onOwnerDisconnect` handles entities that were previously owned by the user, removing those that have the removeOnDisconnect flag set to true on the UserOwned component.

	`removeUser` handles the removal of the user from the list and the table




