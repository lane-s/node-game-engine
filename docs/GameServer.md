#GameServer

'init' *creates the world on the server*

'update' starts running the game loop at the given tickRate. Every tick, the server runs the appropriate systems which return a list of changed entities. This list is integrated into the main list of changes for the tick using `integrateChanges`

Update also handles the case of entities being created/destroyed or having components added/removed. When a component is added or removed from an entity, the client needs to be notified of the changes. To handle this, [Entity](public/Entity.md) contains special components called `created` and `removed`. Components in the `componentList` of `created` are sent to clients. The `removed` component is also sent to clients if it contains any components in its `componentList` OR if the `removeEntity` flag is true. If the `removeEntity` flag is true, the entity is removed from the [EntityManager](public/EntityManager.md).