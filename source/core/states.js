
villo.states = {
/**
	villo.states.set
	================
	
	Sets the state of the application. This can then be retrieved with villo.states.get.
    
	Calling
	-------

	`villo.states.set(anything)`
	
	- You can pass this application any data type, and it will be set.

	Returns
	--------
	
	The function returns true the data was successfully set.
		
	Use
	---
		
		villo.states.set({
			//You can pass any data to this function.
			"location": "home"
		});

*/
	set: function(setObject){
		villo.store.set("VAppState", setObject);
		villo.storage.set({
			privacy: true,
			title: "VAppState",
			data: setObject,
			callback: villo.doNothing
		});
		return true;
	},
/**
	villo.states.get
	================
	
	Gets the state of the application, which has been set with villo.states.set.
    
	Calling
	-------

	`villo.states.get({instant: boolean, callback: function})`
	
	- The "instant" parameter allows you to bypass cloud states and only get the locally-stored state. This defaults to false (get states from the cloud), and is not required.
	- The "callback" function is called when the function is completed.

	Callback
	--------
	
	The state of the application (as set by villo.states.set) will be passed to the callback.
		
	Use
	---
		
		villo.states.get({
			"instant": false,
			"callback": function(state){
				//The "state" variable contains the state of the application.
			}
		});

*/
	get: function(getObject){
		if (getObject.instant && getObject.instant === true) {
			//Don't force return, allow callback:
			var ret = villo.store.get("VAppState") || false
			if(getObject.callback){
				getObject.callback(ret);
			}
			return ret;
		} else {
			villo.storage.get({
				privacy: true,
				title: "VAppState",
				callback: function(transit){
					if (transit === false || transit === 33) {
						getObject.callback(villo.store.get("VAppState") || false);
					} else {
						getObject.callback(transit);
					}
				}
			});
		}
	}
};