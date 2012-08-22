
villo.settings = {
/**
	villo.settings.load
	===================
	
	Load your applications settings, which have been set through villo.settings.save. Villo Settings uses villo.storage to store the settings, in addition to using local settings to fall back on. Additionally, Villo Settings is designed to handle JSON, and saves the settings object to the object villo.app.settings.
    
    Calling
	-------

	`villo.settings.load({instant: boolean, callback: function})`
    
    - The "instant" parameter can be set to true if you wish to only retrieve the latest settings, and not the use the settings stored on the server. This parameter defaults to false, and is not required.
    - "Callback" is a function that is when the settings are loaded. The settings stored in the villo.app.settings object is passed to the callback. The callback function is not required if you set the "instant" parameter to true.

	Returns
	-------
	
	If the "instant" parameter is set to true, then the function will return the villo.app.settings object.

	Callback
	--------
	
	The most recent settings object (villo.app.settings) will be passed to the callback.
	
	Use
	---
	
	Example use with instant _off_:
	
		villo.settings.load({
			instant: false,
			callback: function(prefs){
				//Settings are now loaded. We can grab a specific aspect of the callback object now:
				var prefOne = prefs.preferenceOne;
				//We can also load from the villo.app.settings object:
				var prefTwo = villo.app.settings.preferenceTwo;
			}
		});
		
	Example use with instant _on_:
		
		var prefs = villo.settings.load({instant: true});
		//Settings are now loaded. We can grab a specific aspect of the return object now:
		var prefOne = prefs.preferenceOne;
		//We can also load from the villo.app.settings object:
		var prefTwo = villo.app.settings.preferenceTwo;
		
	Notes
	-----
	
	When the settings are loaded, they are saved in villo.app.settings.
	
	Villo Settings are loaded when the app is launched, allowing you to access villo.app.settings from the start of your application. The application will first load the locally stored settings, and will then load settings from the cloud and call the "settings" hook.
	
	If your application is offline, then Villo will load the local version of the settings.
	
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
			var theTimestamp = villo.store.get("VilloSettingsProp").timestamp || 0;
			villo.storage.get({
				privacy: true,
				title: "VilloSettingsProp",
				callback: function(transit){
					if (typeof(transit) !== "object") {
						//Some error, grab local settings:
						villo.app.settings = villo.store.get("VilloSettingsProp").settings;
						loadObject.callback(villo.app.settings);
					}else{
						//Check for timestamps.
						if (transit.timestamp > theTimestamp) {
							//Server version is newer. Replace our existing local storage with the server storage.
							villo.store.set("VilloSettingsProp", transit);
							villo.app.settings = transit.settings;
							loadObject.callback(villo.app.settings);
						} else {
							//Local version is newer. 
							villo.app.settings = villo.store.get("VilloSettingsProp").settings;
							loadObject.callback(villo.app.settings);
							villo.settings.save({settings: villo.app.settings});
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
    
    - The "settings" object contains your actual settings. Your settings MUST be formatted as JSON! If you do not define this, then the object at villo.app.settings will be used.

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
		settingsObject.settings = saveObject.settings || villo.app.settings;
		villo.store.set("VilloSettingsProp", settingsObject);
		villo.app.settings = settingsObject.settings;
		villo.storage.set({
			privacy: true,
			title: "VilloSettingsProp",
			data: settingsObject,
			callback: villo.doNothing
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
		
	Notes
	-----
	
	This function will not remove any settings stored in the cloud.

*/
	remove: function(){
		villo.store.remove("VilloSettingsProp");
		villo.app.settings = {};
		return true;
	},
/**
	villo.settings.exists
	=====================
	
	Check to see if application settings exist. The function can check for the existence of both local and cloud settings.
    
    Calling
	-------

	`villo.settings.exists({cloud: boolean, callback: function})`
    
    - Set "cloud" to true if you wish to check if settings exist on the cloud. This defaults to false (only check locally), and is optional.
    - The "callback" is a function that will be called after it is determined if the settings exist.
    
    Callback
    --------
    
    Either true or false will be passed to the callback, depending on if the settings exist or not.

	Returns
	-------
	
	If the "cloud" parameter is not set to true, the function returns true if the settings exist locally or false if they do not.
	
	Use
	---
		
		villo.settings.exists({
			//Check to see if settings exist in the cloud. Set to false to only see if settings exist locally.
			"cloud": true
			"callback": function(exists){
				if(exists){
					//This user has used settings before.
				}else{
					//This user has never used settings in this application.
				}
			}
		});
		
	Notes
	-----
	
	The function will only return true or false if you do not set the "cloud" option to true.

*/
	exists: function(options){
		if(options && options.cloud && options.cloud === true){
			villo.storage.get({title: "VilloSettingsProp", privacy: true, callback: function(isit){
				if(isit === false){
					options.callback(false);
				}else{
					options.callback(true);
				}
			}});
		}else{
			if (villo.store.get("VilloSettingsProp")) {
				if(options && options.callback){
					options.callback(true);
				}
				return true;
			}else{
				if(options && options.callback){
					options.callback(false);
				}
				return false;
			}
		}
	}
};
