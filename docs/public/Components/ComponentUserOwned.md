#ComponentUserOwned

This component contains a property for `ownerID`, which is the user id of the user that owns the entity. An ownerID of -1 means the entity is not currently owned by a user.

The `removeOnDisconnect` flag determines whether the entity should be destroyed when the owner disconnects.

The `controlEnabled` flag determines whether the entity is currently taking input from the owner.

