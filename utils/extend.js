/* Villo Extend */
(function(){
	/**
	 * OLD DOCUMENTATION, NEED THE NEW STUFF:
	 * 
	 * Extend or update villo's functionality.
	 * @param {string} namespace The namespace that your villo extension will live in. All extentions be pushed into the villo.e root namespace.
	 * @param {object} javascripts The functionality you want to add.
	 * @return {boolean} Returns true if the function was executed.
	 * @since 0.8.0
	 */
	villo.extend = function(extension){
		console.log("extending");
		//New Villo Extension System:
		if (extension.name === "VIroot") {
			villo += extension.functions;
		} else {
			if (villo[extension.name] && typeof(villo[extension.name]) == "object") {
				//Add-on
				villo.mixin(villo[extension.name], extension.functions);
			} else {
				//OG
				villo[extension.name] = extension.functions;
			}
			if (typeof(villo[extension.name].init) == "function") {
				villo[extension.name].init();
				if (extension.cleanAfterUse && extension.cleanAfterUse == true) {
					delete villo[extension.name].init;
				}
			}
		}
		
	}, villo.mixin = function(destination, source){
		for (var k in source) {
			if (source.hasOwnProperty(k)) {
				destination[k] = source[k];
			}
		}
		return destination;
	}
})();