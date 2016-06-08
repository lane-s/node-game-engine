#Entity

An Entity consists of an id and a list of [Components](Componets/Components.md). 

Every entity also has two special components called 'created' and 'removed'. These are used by [GameServer](../GameServer.md) and [Client](Client/Client.md).

'removed' is used so that the server can notify the client that a component or entity should be removed before actually removing it from memory.

'created' is used so that the server can notify the client that a component was created even if that component was not changed by any systems.