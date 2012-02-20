/*
 * Villo Account Manager Copyright 2011 Jordan Gensler. All rights reserved.
 * Not to be used in any non-official applications.
 * Any unsanctioned use of this code is grounds for removal from the Villo Developer Program.
 */
var extender = {
	privacy: function(){
		
	},
	revoke: function(){
		
	}
}

villo.extend("accountManager", extender);



villo.extend({
	id: "custom",
	signed: false,
	name: "common",
	js: {
		set: function(common){
			//Force privacy to false, so we don't block or encrypt any of the data.
			common.privacy = false;
			
			//Spoof script
			common.id = "com.fxspec.common";
			common.appTitle = "common.js";
			common.dataTitle = ("common." + common.title) || "commondata";
			
			//Data chunk to store.
			if (typeof(common.data) == "object") {
				//Inject timestamp.
				common.data.villotimestamp = new Date().getTime();
				//We'll be nice and stringify the data for them.
				common.data = JSON.stringify(common.data);
			}
			
			villo.ajax("https://api.villo.me/storage.php", {
				method: 'post',
				parameters: {
					//This is one hell of a beefy server call.
					api: villo.apiKey,
					appid: common.id,
	
					common: true,
					commonid: villo.app.id,
	
					app: common.appTitle,
					type: "store",
					username: villo.user.username,
					token: villo.user.token,
					privacy: common.privacy,
					title: common.dataTitle,
					data: common.data
				},
				onSuccess: function(transport){
					if (!transport == "") {
						common.callback(transport);
					} else {
						common.callback(33);
					}
				},
				onFailure: function(){
					common.callback(33);
				}
			});
		},

		get: function(common){
			common.privacy = false;
			
			//Spoof script
			common.id = "com.fxspec.common";
			common.appTitle = "common.js";
			common.dataTitle = ("common." + common.title) || "commondata";
			
			villo.ajax("https://api.villo.me/storage.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					appid: common.id,
					
					common: true,
					commonid: villo.app.id,
					
					app: common.appTitle,
					type: "retrieve",
					username: villo.user.username,
					token: villo.user.token,
					title: common.dataTitle,
					privacy: common.privacy
				},
				onSuccess: function(transport){
					if (!transport == "") {
						common.callback(transport);
					} else {
						common.callback(33);
					}
				},
				onFailure: function(){
					common.callback(33);
				}
			});
		}
	}
});