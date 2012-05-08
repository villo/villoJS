
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
		//TODO: loop through use and import features we want.
	}else{
		//Import all features:
		villo.mixin(this, villo.Game.features);
	}
	
	//Events
	//General mixin
	//Create
	
	if(invoke){
		if(invoke === "all"){
			//Create the "all room".
		}
	}
	
	return this;
};

//Define pluggable features:
villo.Game.features = {
	chat: {},
	presence: {},
	data: {}
};
