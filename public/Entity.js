 //a removed component which contains a list of components to remove by name.
 //Empty list means completely remove the entity
 ComponentRemoved = function(componentList, removeEntity)
 {
 	this.componentList = componentList || [];
 	this.removeEntity = removeEntity || false;
 }
 ComponentRemoved.prototype.name = 'removed';

 //a created component which contains a list of components to create
 ComponentCreated = function(componentList)
 {
 	this.componentList = componentList || [];
 }
 ComponentCreated.prototype.name = 'created';

 //These components are neccessary so that the server can tell 
 //the client to create and remove components before actually removing the components

Entity = function()
{
 this.id = -1;
 
 // The component data will live in this object
 this.components = {};

 //Automatically give new entities an empty created/removed component
 createComponent = new ComponentCreated();
 removeComponent = new ComponentRemoved();

 this.components[createComponent.name] = new ComponentCreated();
 this.components[removeComponent.name] = new ComponentRemoved([],false);
 
 return this;

}

 Entity.prototype.getID = function()
 {
 	return this.id;
 }

 Entity.prototype.setID = function(id)
 {
 	this.id = id;
 }


 //We remove an entity by clearing it's components then adding a removed component
 Entity.prototype.remove = function(remove)
 {
 	this.clearComponents();
 	this.components['removed'] = new ComponentRemoved([],true);
 	this.components['created'] = new ComponentCreated();
 }
 
 Entity.prototype.addComponent = function addComponent ( component ){
 // Add component data to the entity- functions the same as updating component
 // NOTE: The component must have a name property (which is defined as 
 // a prototype protoype of a component function)
 this.components[component.name] = component;
 this.components.created.componentList.push(component);
 return this;
 };

 Entity.prototype.getComponent = function(componentName)
 {
 	var name = componentName;
 	if(typeof componentName === 'function')
 	{
 		name = componentName.prototype.name;
 	}
 	return this.components[name];
 }

 //Returns a list of components (without the created component since it is only used server side and every server-side entity has it)
 Entity.prototype.getComponentList = function()
 {
 	var componentList = [];
 		//Iterate over every component in the entity and add to the data object
		for (var component in this.components) {
    		if (this.components.hasOwnProperty(component)) {
    			if(component !== 'created') //The client has no use for this component
    			{
        		componentList.push(this.components[component]);
        		}
    		}
		}
	return componentList;
 }
 //Returns data in correct format for sending over sockets
 Entity.prototype.getData = function()
 {
 	var entityData = {};
 	entityData.id = this.id;
 	entityData.components = this.getComponentList();
 	return entityData;
 }

 Entity.prototype.removeComponent = function removeComponent ( componentName ){
 // Remove component data by removing the reference to it.
 // Allows either a component function or a string of a component name to be
 // passed in
 var name = componentName; // assume a string was passed in
 
 if(typeof componentName === 'function'){ 
 // get the name from the prototype of the passed component function
 name = componentName.prototype.name;
 }
 
 // Remove component data by removing the reference to it
 delete this.components[name];
 this.components.removed.componentList.push(component);
 return this;
 };

 //Clear all components but keep the removed component if present
 Entity.prototype.clearComponents = function()
 {
 	this.components = {};
 }

 //Add a group of components using an assemblage with a componentList
 Entity.prototype.addAssemblage = function addAssemblage(assemblage)
 {
 	if(typeof assemblage.componentList !== 'undefined')
 	{
 		for(i = 0; i < assemblage.componentList.length; i++)
 		{
 			this.addComponent(assemblage.componentList[i]);
 		}
 	}
 	return this;
 }
 
 Entity.prototype.print = function print () {
 // Function to print / log information about the entity
 console.log(JSON.stringify(this, null, 4));
 return this;
 };

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = Entity;
else
    window.Entity = Entity;