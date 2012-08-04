/**
	villo.Game
	==========
	
    Provides an easy-to-use, object-oriented framework for making multi-player games.
    
    For more information on using villo.Game, see "Building Games in Villo".
    
	Calling
	-------

	`new villo.Game({name: string, type: string, use: array, events: object, create: function)`
	
	- The "name" is a string given to the game instance. Games use the given name to communicate.
	- The "type" is defines the type of game that you are creating, and sets up different channels of communication based that type. Currently, the two built-in types are "all" and "none".
	- Use (optional)
	- Events (optional)
	- Create (optional)
	
	Additionally, you can put any other properties in the call and they will be added to the prototype.

	Returns
	-------
		
	Returns the object of the constructed game. This allows you to store the return value to a variable and reference the constructed game object to call methods.
		
	Use
	---
		
		var mmo = new villo.Game({
			
		});
		
	For a better use example, see "Game Demo" in the examples folder.
	
	Notes
	-----
	
	This is only designed to handle the online interactions in games, and is not designed to handle any actual game mechanics.

*/

villo.Game = function(gameObject){
	
	//If they forget to include the new keyword, we'll do it for them, so that we always have a new instance:
	if (!(this instanceof villo.Game)){
		villo.verbose && console.log("Forgot to include new keyword with villo.Game, attempting to call new instance.");
		return new villo.Game(gameObject);
	}
	
	if(gameObject.name){
		//set the name
		this.name = gameObject.name;
		//delete reference
		delete gameObject.name;
	}else{
		//we need a name
		return;
	}
	
	var invoke = "";
	if(gameObject.type){
		this.type = gameObject.type;
		invoke = this.type;
		delete gameObject.type;
	}else{
		//Default to "all" type:
		this.type = "all";
		invoke = "all";
	}
	
	if(gameObject.use){
		if(gameObject.indexOf().clean && gameObject.use.clean === true){
			invoke = false;
		}
		this.use = gameObject.use;
		delete gameObject.use;
		for(var x in this.use){
			if(this.use.hasOwnProperty(x)){
				if(this.use[x] === "clean"){
					invoke = false;
				}else if(villo.Game.features[x]){
					//Do they want it?
					if(this.use[x] === true){
						//Add it in:
						this[x] = villo.clone(villo.Game.features[x]);
					}
				}
			}
		}
	}else{
		//Import all features:
		villo.mixin(this, villo.clone(villo.Game.features));
	}
	
	//Import the events. Its up to the invoke type to call the events.
	if(gameObject.events){
		this.events = gameObject.events;
		delete gameObject.events;
		//Create the tiggerEvent function:
		this.triggerEvent = function(triggerObject){
			//Event exists:
			if(this.events[triggerObject.name]){
				this[this.events[triggerObject.name]](triggerObject.data || true);
				return true;
			}else{
				//Event doesn't exist:
				return false;
			}
		};
	}
	
	//Import the create function, to be called after the general mixin and invoke type.
	if(gameObject.create){
		this.create = gameObject.create;
		delete gameObject.create;
	}

	//Time to mixin what's left of gameObject:
	villo.mixin(this, gameObject);
	
	//Check to see if we should call the type function:
	var invoker = villo.bind(this, function(name){
		if(villo.Game.invoke[name]){
			//Check to see if we want to inherit, and if the inherit type exists:
			if(villo.Game.invoke[name].inherit && villo.Game.invoke[name].inherit !== "" && villo.Game.invoke[villo.Game.invoke[name].inherit]){
				//recursive call on invoke function:
				invoker(villo.Game.invoke[name].inherit);
			}
			//Call the invoke function, binding scope:
			villo.Game.invoke[name].create.call(this, true);
		}
	});
	//Run the invoker:
	if(invoke){
		invoker(this.type);
	}
	
	if(this.create && typeof(this.create) === "function"){
		//We pass the create function true, just for giggles.
		this.create(true);
	}
	
	//Return the prototype, to allow for calling methods off of a variable reference:
	return this;
};

//Create our empty objects which will eventually be filled with features and types:
villo.Game.features = {};
villo.Game.invoke = {};

/*
 * The following two functions are extremely simple, but still handy utilities for defining types and features in villo.Game.
 */

//Add a feature for villo.Game:
villo.Game.feature = function(featureObject){
	//Extract name:
	var name = featureObject.name;
	delete featureObject.name;
	
	if(villo.Game.features[name]){
		//Already exists:
		villo.mixin(villo.Game.features[name], featureObject);
	}else{
		//New:
		villo.Game.features[name] = featureObject;
	}
};

//Define a type:
villo.Game.type = function(typeObject){
	villo.Game.invoke[typeObject.name] = {
		create: typeObject.create || function(){},
		inherit: typeObject.inherit || ""
	};
};

/*
 * FEATURES:
 */

//Add Chat feature:
villo.Game.feature({
	name: "chat",
	//default room value: 
	room: "main",
	send: function(sendObject){
		villo.chat.send({
			room: sendObject.room || this.room,
			message: sendObject.message
		});
		return this;
	},
	join: function(joinObject){
		//Set the room to the latest join value:
		this.room = joinObject.room || this.room;
		villo.chat.join({
			room: this.room,
			callback: joinObject.callback
		});
		return this;
	},
	history: function(){},
	leave: function(){},
	leaveAll: function(){
		villo.chat.leaveAll();
		return this;
	}
});

//Add Presence feature:
villo.Game.feature({
	name: "presence"
});

//Add Data feature:
villo.Game.feature({
	name: "data",
	//Send data down the public lines:
	send: function(){},
	//Send data at a given interval:
	interval: function(){},
	//Send data after a given timeout:
	timeout: function(){},
	//Join the data rooms:
	join: function(){},
	//Send data to a specific user:
	user: function(){}
});

/*
 * TYPES:
 */

//Add the "all" type:
villo.Game.type({
	name: "all",
	create: function(){
		//Check to see if we have chat enabled:
		if(this.chat){
			this.chat.join({
				room: "game/" + this.name,
				callback: villo.bind(this, function(callbackObject){
					this.triggerEvent({
						name: "chat",
						data: callbackObject
					});
				})
			});
		}
		//Manage presence separately:
		if(this.presence){
			
		}
		//And finally subscribe to some data!
		if(this.data){
			this.data.join({
				name: this.name
			});
		}
		return this;
	}
});
