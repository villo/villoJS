
/* Villo Extend */

//Undocumented Bind Function:
villo.bind = function(scope, _function) {
	return function() {
		return _function.apply(scope, arguments);
	};
};

//Undocumented Object Mixin Function:
villo.mixin = function(destination, source){
	for (var k in source) {
		if (source.hasOwnProperty(k)) {
			destination[k] = source[k];
		}
	}
	return destination;
};

//Undocumented Object Clone Function:
villo.clone = function(obj){
	if (typeof obj !== "object"){
		return obj;
	}
	if (obj.constructor === RegExp){
		return obj;
	}
	
	var retVal = new obj.constructor();
	
	for (var key in obj) {
		if(obj.hasOwnProperty(key)){
			retVal[key] = villo.clone(obj[key]);
		}
	}
	
	return retVal;
};

/**
	villo.extend
	=================
	
	Allows developers to extend Villo functionality by adding methods to the Villo object.
    
	Calling
	-------

	`villo.extend(object (to extend), object (extension))`
	
	- The first object is the object that you want to extend.
	- The second object is the object which you wish to add to the first. Additionally, if you define a function named "create" in the object, the function will run when the extension is loaded.
	
	Returns
	-------
	
	The function returns the object you were extending.
		
	Use
	---
		
		villo.extend(villo, {
			suggest:{
				get: function(){
					//Function that can be called using villo.
					this.users = ["kesne", "admin"];
					return this.users;
				}
			},
			create: function(){
				//This will be executed when the extension is loaded.
				villo.log("Create function was called.");
			}
		});
		//Sample call to our extension:
		var users = villo.suggest.get();
		
	Notes
	-----

	Any methods added through villo.extend will override other methods if they already exist.
	
	If you define an create function in the object, then it will be run when the extension is loaded. The create function will be destroyed after it is run.

*/
villo.extend = function(that, obj){
	villo.verbose && console.log("Extending Villo:", that);
	villo.mixin(that, obj);
	if (typeof(that.create) === "function") {
		that.create();
		if(that._ext && that._ext.keepit && that._ext.keepit === true){
			delete that._ext;
		}else{
			delete that.create;
		}
	}
	return that;
};
