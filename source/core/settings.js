/* 
 * Villo Settings
 * ==========
 * Copyright 2011 Jordan Gensler. All rights reserved.
 * 
 * 
 * For Docs:
 * Specialized for settings, and they automatically load every time the app launches.
 * Can be accessed in villo.app.settings, and you can reload them with villo.settings.load();
 * Online and offline storage, automatically returns the offline version if connection to the server fails.
 * Designed for JSON handling.
 * Timestamped entries
 * Pass it instant to get it instantly!
 * Privacy, too. So encrypted on the server end.
 * 
 */
villo.settings = {
	//We strap the settings on to villo.app.settings.
/**
	villo.settings.load
	===================
	
	Load your applications settings, which have been set through villo.settings.save. Villo Settings uses villo.storage to store the settings, in addition to using local settings to fall back on. Additionally, Villo Settings is designed to handle JSON, and saves the settings object to the object villo.app.settings.
    
    Calling
	-------

	`villo.settings.load({instant: boolean, callback: function})`
    
    - "Callback" is a function that is when the settings are loaded. The settings stored in the villo.app.settings object is passed to the callback. The callback function is not required if you set the "instant" parameter to true.
    - The "instant" parameter can be set to true if you wish to only retrieve the latest settings, and not the use the settings stored on the server. This parameter defaults to false, and is not required.

	Returns
	-------
	
	If the "instant" parameter is set to true, then the function will return the villo.app.settings object.

	Callback
	--------
	
	The most recent settings object (villo.app.settings) will be passed to the callback.
	
	Use
	---
	
	Example use with instant off:
	
		villo.settings.load({
			instant: false,
			callback: function(prefs){
				//Settings are now loaded. We can grab a specific aspect of the callback object now:
				var prefOne = prefs.preferenceOne;
				//We can also load from the villo.app.settings object:
				var prefTwo = villo.app.settings.preferenceTwo;
			}
		});
		
	Example use with instant on:
		
		var prefs = villo.settings.load({instant: true});
		//Settings are now loaded. We can grab a specific aspect of the return object now:
		var prefOne = prefs.preferenceOne;
		//We can also load from the villo.app.settings object:
		var prefTwo = villo.app.settings.preferenceTwo;
		
	Notes
	-----
	
	When the settings are loaded, they are saved in villo.app.settings.
	
	Villo Settings are loaded when the app is launched, allowing you to access villo.app.settings from the start of your application.
	
	If your application is currently offline, then Villo will load the local version of the settings.
	
	When you set the settings through villo.settings.save, the settings are timestamped and uploaded to the server. When you use villo.settings.load, the latest version of settings are loaded.
	
	Villo Settings uses the privacy feature in villo.storage, which encrypts the settings on the server.
	
	If the version of the settings on the server are older than the settings on your device, then the server will be updated with the local settings.

*/
	load: function(loadObject){
		if (loadObject.instant && loadObject.instant === true) {
			if(villo.store.get("VilloSettingsProp")){
				villo.app.settings = villo.store.get("VilloSettingsProp").settings;
				if(loadObject.callback){
					loadObject.callback(villo.app.settings);
				}
				return villo.app.settings;
			}else{
				if(loadObject.callback){
					loadObject.callback(false);
				}
				return false;
			}
		} else {
			var theTimestamp = villo.store.get("VilloSettingsProp").timestamp;
			villo.storage.get({
				privacy: true,
				title: "VilloSettingsProp",
				callback: function(transit){
					//TODO: Check for the need of this: 
					transit = JSON.parse(JSON.parse(transit));
					if (!transit.storage) {
						//Offline: 
						villo.app.settings = villo.store.get("VilloSettingsProp").settings;
						loadObject.callback(villo.app.settings);
					} else {
						//Check for timestamps.
						if (transit.storage.timestamp > theTimestamp) {
							//Server version is newer. Replace our existing local storage with the server storage.
							villo.store.set("VilloSettingsProp", transit.storage);
							villo.app.settings = transit.storage.settings;
							loadObject.callback(villo.app.settings);
						} else {
							//Local version is newer. 
							//TODO: Update server.
							villo.app.settings = villo.store.get("VilloSettingsProp").settings;
							loadObject.callback(villo.app.setting);
						}
					}
				}
			});
		}
	},
/**
	villo.settings.save
	===================
	
	Save settings for your application. Settings uses villo.storage to store the settings, in addition to using local settings to fall back on. When you save settings, they are available in the villo.app.settings object.
    
    Calling
	-------

	`villo.settings.save({settings: object})`
    
    - The "settings" object contains your actual settings. Your settings MUST be formatted as JSON!

	Returns
	-------
	
	Returns the villo.app.settings object, which your settings have now been added to.

	
	Use
	---
		
		var userSettings = {
			"preferenceOne": true,
			"preferenceTwo": false,
			"isCool": "Oh yes, yes it is."
		}
		
		villo.settings.save({
			settings: userSettings
		});
		
	Notes
	-----
	
	When the settings are loaded, they are saved in villo.app.settings.
	
	Villo Settings are loaded when the app is launched, allowing you to access villo.app.settings from the start of your application.
	
	Settings are user-specific, not universal.

*/
	save: function(saveObject){
		var settingsObject = {};
		var d = new Date();
		//Universal Timestamp Win
		var timestamp = d.getTime();
		settingsObject.timestamp = timestamp;
		settingsObject.settings = saveObject.settings;
		villo.store.set("VilloSettingsProp", settingsObject);
		villo.app.settings = settingsObject.settings;
		villo.storage.set({
			privacy: true,
			title: "VilloSettingsProp",
			data: settingsObject
		});
		return villo.app.settings;
	},
/**
	villo.settings.remove
	=====================
	
	Removes the local version of the settings.
    
    Calling
	-------

	`villo.settings.remove()`
    
    This function takes no arguments.

	Returns
	-------
	
	Returns true if the settings were removed.
	
	Use
	---
		
		villo.settings.remove();

*/
	remove: function(){
		villo.store.remove("VilloSettingsProp");
		villo.app.settings = {};
		return true;
	}
};
