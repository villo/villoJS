/*
 * Villo Push States Copyright 2011 Jordan Gensler. All rights reserved.
 */


var extender = {
	listen: function(listenObject){
		villo.log("HERE");
		if (villo.pushFramework && villo.pushFramework == "pubnub") {
			PUBNUB.subscribe({
				channel: "VILLO/STATES/" + villo.app.id.toUpperCase(),
				callback: function(message){
					villo.log("WHOAAAA")
					villo.log(message);
					//message = JSON.parse(message);
					store.set("VAppState", message);
					listenObject.callback(message);
				},
				error: function(e){
					villo.log("Error connecting to Push States. PubNub will attempt to automatically reconnect.");
				}
			});
		}else{
		}
	},
	set: function(setObject, callbackFunc){
		store.set("VAppState", setObject);
		villo.storage.set({
			privacy: true,
			title: "VAppState",
			data: setObject,
			callback: function(transit){
				//callbackFunc(transit);
			}
		});
		//Push States
		//if (setObject.push && setObject.push == true) {
			PUBNUB.publish({
				channel: "VILLO/STATES/" + villo.app.id.toUpperCase(),
				message: setObject
			});
		///}
	},
	get: function(getObject){
		if (getObject.instant && getObject.instant == true) {
			//Don't force return, allow callback:
			if (getObject.callback) {
				getObject.callback(store.get("VAppState"));
			}
			return store.get("VAppState");
		} else {
			villo.storage.get({
				privacy: true,
				title: "VAppState",
				callback: function(transit){
					var transit = JSON.parse(transit);
					transit.storage = JSON.parse(villo.stripslashes(transit.storage));
					
					villo.log(transit);
					if (!transit.storage) {
						getObject.callback(store.get("VAppState"));
					} else {
						getObject.callback(transit.storage);
					}
				}
			});
		}
	},
}

//Custom Extention off of the Core villo root
villo.extend({
	id: "custom",
	signed: true,
	name: "states",
	js: extender
});