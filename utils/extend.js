
/* Villo Extend */
(function(){
	//Undocumented Utility Function:
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
	
	Allows developers to extend Villo functionality by adding methods to the Villo object. As of Villo 1.0, villo.extend actually adds the extend function to the Object prototype.
    
	Calling
	-------

	`villo.extend(object)`
	
	- The only parameter that villo.extend takes is the object. Villo will add the object into the main Villo object. Additionally, if you define a function named "init" in the object, the function will run when the extension is loaded.
	
	Returns
	-------
	
	The function returns the Villo object, or the part of the object you were modifying.
		
	Use
	---
		
		villo.extend({
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
	
	Because this function is actually an addition to the Object prototype, you can call it on any part of Villo that is an object.

	For example, to extend the villo.profile, object, you call `villo.profile.extend({"suggest": function(){}});`, which would add the suggest method to villo.profile.
	
	Any methods added through villo.extend will override other methods if they already exist.
	
	If you define an init function in the object, then it will be run when the extension is loaded. The init function will be deleted after it is run.

*/
	Object.defineProperty(Object.prototype, "extend", {
		value: function(obj){
			villo.verbose && console.log("Extending Villo:", this);
			villo.mixin(this, obj);
			if (typeof(this.init) == "function") {
				this.init();
				if(this._ext && this._ext.keepit && this._ext.keepit === true){
					//Do nothing
				}else{
					delete this.init;
				}
			}
			return this;
		},
		writable: true,
		configurable: true,
		enumerable: false
	});
})();