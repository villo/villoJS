
//We store references to the games here just for ease of use.
villo.games = {};

/**
	villo.Game
	==========
	
    Provides an easy-to-use, object-oriented framework for making multi-player games.
    
    For more information on using villo.Game, see "Building Games in Villo".
    
	Calling
	-------

	`new villo.Game({name: string, type: string, features: array, events: object, create: function})`
	
	- The "name" is a string given to the game instance. Games use the given name to communicate, and the name should be unique for every instance of villo.Game.
	- The "type" is defines the type of game that you are creating, and sets up different channels of communication based that type. Currently, the two built-in types are "all" and "none".
	- The "features" array lets you define what features you would like the game constructor to include. If you don't include this parameter, all of the features will be imported. For more details, see the "Features" section.
	- Events (optional)
	- The "create" function will be called when your game is initialized. This function is optional.
	
	Additionally, you can put any other properties in the call and they will be added to the prototype of the constructed game.
	
	Types
	-----
	
	Types in villo.Game help you get started even faster by setting up some features
	
	Features
	--------
	
	Features works with the villo.Game core, giving you modular features that build on top of Villo's existing API. Currently, two features are included with villo.Game: chat and data.
	
	### Chat ###
	
	Some blurb about chat.
	
	### Data ###
	
	Some blurb about data.
	
	For more details on features, see "Expanding villo.Game".
	
	Returns
	-------
		
	Returns the object of the constructed game. This allows you to store the return value to a variable and reference the constructed game object to call methods. Additionally, a reference to the game will be added to the villo.games object.
	
	Use
	---
		
		var mmo = new villo.Game({
			name: "mmo",
			type: "all"
		});
		
		//Broadcast something:
		mmo.data.send({message: "Hello."});
		//We can also reference the constructed game this way:
		villo.games.mmo.data.send({message: "Why hello there!"});
		
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
		return false;
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
	
	if(gameObject.features){
		this.features = gameObject.features;
		delete gameObject.features;
		for(var x in this.features){
			if(this.features.hasOwnProperty(x)){
				if(villo.Game.features[this.features[x]]){
					//Add it in:
					this[this.features[x]] = villo.clone(villo.Game.features[this.features[x]]);
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
	
	//Store a reference:
	villo.games[this.name] = this;
	
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
	history: function(histObject){
		villo.chat.history({
			room: histObject.room || this.room,
			callback: histObject.callback
		});
		return this;
	},
	leave: function(room){
		villo.chat.leave(room || this.room);
		return this;
	},
	leaveAll: function(){
		villo.chat.leaveAll();
		return this;
	}
});

//Add Data feature:
villo.Game.feature({
	name: "data",
	room: "data-main",
	//Send data down the public lines:
	send: function(){
		
	},
	//Send data at a given interval:
	interval: function(){
		
	},
	//Send data after a given timeout:
	timeout: function(){
		
	},
	//Join the data rooms:
	join: function(){
		this.room = ("data-" + joinObject.room) || this.room;
	},
	//Send data to a specific user:
	user: function(){
		
	}
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
				room: "game-" + this.name,
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
			//TODO
		}
		//And finally subscribe to some data!
		if(this.data){
			this.data.join({
				room: this.name,
				callback: villo.bind(this, function(callbackObject){
					this.triggerEvent({
						name: "data",
						data: callbackObject
					});
				})
			});
		}
		return this;
	}
});

//Add the "none" tyoe:
villo.Game.type({
	name: "none",
	create: villo.doNothing
});
