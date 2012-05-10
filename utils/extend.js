
/* Villo Extend */

//Undocumented Bind Function:
villo.bind = function(scope, _function) {
	return function() {
		return _function.apply(scope, arguments);
	}
}

//Undocumented Object Mixin Function:
villo.mixin = function(destination, source){
	for (var k in source) {
		if (source.hasOwnProperty(k)) {
			destination[k] = source[k];
		}
	}
	return destination;
}
/**
	villo.extend
	=================
	
	Allows developers to extend Villo functionality by adding methods to the Villo object.
    
	Calling
	-------

	`villo.extend(object (to extend), object (extensions))`
	
	- The first object is the object that you want to extend.
	- The second object is the object which you wish to add to the first. Additionally, if you define a function named "init" in the object, the function will run when the extension is loaded.
	
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
			init: function(){
				//This will be executed when the extension is loaded.
				villo.log("Init functionw was called.");
			}
		});
		
	Notes
	-----

	For example, to extend the villo.profile, object, you call `villo.profile.extend({"suggest": function(){}});`, which would add the suggest method to villo.profile.
	
	Any methods added through villo.extend will override other methods if they already exist.
	
	If you define an init function in the object, then it will be run when the extension is loaded. The init function will be deleted after it is run.

*/
villo.extend = function(that, obj){
	villo.verbose && console.log("Extending Villo:", that);
	villo.mixin(that, obj);
	if (typeof(that.init) == "function") {
		that.init();
		if(that._ext && that._ext.keepit && that._ext.keepit === true){
			delete that._ext;
		}else{
			delete that.init;
		}
	}
	return that;
}

