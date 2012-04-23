/* 
 * Villo App States
 * ==========
 * Copyright 2011 Jordan Gensler. All rights reserved.
 */
(function(){
	villo.states = {
		set: function(setObject, callbackFunc){
			store.set(villo.app.propBag.states, setObject);
			villo.storage.set({
				privacy: true,
				title: "VAppState",
				data: setObject,
				callback: function(transit){
					//callbackFunc(transit);
				}
			});
		},
		get: function(getObject){
			if (getObject.instant && getObject.instant == true) {
				//Don't force return, allow callback:
				if(getObject.callback){
					getObject.callback(store.get(villo.app.propBag.states));
				}
				return store.get(villo.app.propBag.states);
			} else {
				villo.storage.get({
					privacy: true,
					title: "VAppState",
					callback: function(transit){
						//TODO: Check for the need of this:
						var transit = JSON.parse(transit);
						transit.storage = JSON.parse(villo.stripslashes(transit.storage));
						
						villo.log(transit);
						if (!transit.storage) {
							getObject.callback(store.get(villo.app.propBag.states));
						} else {
							getObject.callback(transit.storage);
						}
					}
				});
			}
		},
	}
})();