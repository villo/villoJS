
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
		var invoke = "all";
		delete gameObject.type;
	}else{
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
	
	if(invoke){
		if(invoke === "all"){
			//Create the "all room".
		}
	}
	
	if(this.create && typeof(this.create) === "function"){
		//We pass the create function true, just for giggles.
		this.create(true);
	}
	
	//Return the prototype, to allow for calling methods off of a variable reference:
	return this;
};

//Define pluggable features:
villo.Game.features = {
	chat: {},
	presence: {},
	data: {}
};
