/* Villo App States */
villo.states = {
	set: function(setObject){
		villo.store.set("VAppState", setObject);
		villo.storage.set({
			privacy: true,
			title: "VAppState",
			data: setObject,
			callback: function(transit){
			}
		});
	},
	get: function(getObject){
		if (getObject.instant && getObject.instant === true) {
			//Don't force return, allow callback:
			if(getObject.callback){
				getObject.callback(villo.store.get("VAppState"));
			}
			return villo.store.get("VAppState");
		} else {
			villo.storage.get({
				privacy: true,
				title: "VAppState",
				callback: function(transit){
					//TODO: Check for the need of this:
					transit = JSON.parse(transit);
					transit.storage = JSON.parse(villo.stripslashes(transit.storage));
					
					villo.log(transit);
					if (!transit.storage) {
						getObject.callback(villo.store.get("VAppState"));
					} else {
						getObject.callback(transit.storage);
					}
				}
			});
		}
	}
};