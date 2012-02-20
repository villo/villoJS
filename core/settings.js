/* 
 * Villo Settings
 * ==========
 * Copyright 2011 Jordan Gensler. All rights reserved.
 */
(function(){
	villo.settings = {
		//We strap the settings on to villo.app.settings.
		load: function(loadObject){
			if (loadObject.instant && loadObject.instant == true) {
				villo.app.settings = store.get("VilloSettingsProp").settings;
				return villo.app.settings;
			} else {
				var theTimestamp = store.get("VilloSettingsProp").timestamp;
				villo.storage.get({
					privacy: true,
					title: "VilloSettingsProp",
					callback: function(transit){
						transit = JSON.parse(JSON.parse(transit));
						if (!transit.storage) {
							villo.app.settings = store.get("VilloSettingsProp").settings
							loadObject.callback(store.get("VilloSettingsProp").settings);
						} else {
							if (transit.storage.timestamp > timestamp) {
								store.set("VilloSettingsProp", transit.storage);
								villo.app.settings = transit.storage.settings
								loadObject.callback(transit.storage.settings);
							} else {
								villo.app.settings = store.get("VilloSettingsProp").settings
								loadObject.callback(store.get("VilloSettingsProp").settings);
							}
						}
					}
				});
			}
		},
		save: function(saveObject){
			var settingsObject = {};
			var d = new Date();
			//Universal Timestamp Win
			var timestamp = d.getTime();
			settingsObject.timestamp = timestamp;
			settingsObject.settings = saveObject.settings;
			store.set("VilloSettingsProp", settingsObject);
			villo.app.settings = settingsObject.settings;
			villo.storage.set({
				privacy: true,
				title: "VilloSettingsProp",
				data: settingsObject
			});
		},
		destroy: function(){
			store.remove("VilloSettingsProp");
		}
	}
})();
