
/*
 * Experimental
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
	
	if(gameObject.type){
		this.type = gameObject.type;
		var invoke = this.type;
		delete gameObject.type;
	}else{
		//Default to "all" type:
		this.type = "all";
		var invoke = "all";
	}
	
	if(gameObject.use){
		if(gameObject.use.clean && gameObject.use.clean === true){
			var invoke = false;
		}
		this.use = gameObject.use;
		delete gameObject.use;
		for(var x in this.use){
			if(this.use.hasOwnProperty(x)){
				//Ensure that the feature exists:
				if(villo.Game.features[x]){
					//Do they want it?
					if(this.use[x] === true){
						//Add it in:
						this[x] = villo.Game.features[x];
					}
				}
			}
		}
	}else{
		//Import all features:
		villo.mixin(this, villo.Game.features);
	}
	
	//Import the events. Its up to the invoke type to call the events.
	if(gameObject.events){
		this.events = gameObject.events;
		delete gameObject.events;
	}
	
	//Import the create function, to be called after the general mixin and invoke type.
	if(gameObject.create){
		this.create = gameObject.create;
		delete gameObject.create;
	}

	//Time to mixin what's left of gameObject:
	villo.mixin(this, gameObject);
	
	//Check to see if we should call the type function:
	if(invoke){
		if(villo.Game.invoke[this.type]){
			//Call the invoke function, binding scope:
			villo.Game.invoke[this.type].call(this, true);
		}
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
}

//Define a type:
villo.Game.type = function(typeObject){
	console.log("new type");
	//Extract name:
	villo.Game.invoke[typeObject.name] = typeObject.create || function(){};
}

/*
 * FEATURES:
 */

//Add Chat feature:
villo.Game.feature({
	name: "chat"
});
//Add Presence feature:
villo.Game.feature({
	name: "presence"
});
//Add Data feature:
villo.Game.feature({
	name: "data"
});

/*
 * TYPES:
 */

//Add the "all" type:
villo.Game.type({
	name: "all",
	create: function(){
		console.log(this);
	}
});
