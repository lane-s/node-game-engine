#Entity-Component-System

The [Entity](public/Entity.md) is the most basic object in the game. Everything besides terrain is an entity. 
Entities are managed both client and server-side using the [EntityManager](public/EntityManager.md)

In the Entity-Component-System design pattern, Entities contain a list of ids and a list of components. 

[Components](public/Components/Components.md) are simply objects that contain a number of properties. 

[Systems](public/Systems/Systems.md) are objects that contain the majority of the game logic. Systems run on entities that subscribe to them every time the game ticks. Some systems run only on the client, and some run only on the server. 