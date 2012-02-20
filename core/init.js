
/* Villo Init/Load */


//TODO:
//Figure out what file format to use. Info.villo seems lame if we're not auto-loading. Info.js? 
//We should also encourage usage of this for things like extensions, where they can have an info.js file that loads up the extension.
//Change what villo.load does based on if it was already called. If it was, use it for excess file loading.


(function(){
	villo.isLoaded = false;
/**
	villo.load
	==================
	
    The load function can be called for two things. It is initially used to initialize the Villo library. Once Villo has been initialized, the function can be used to asynchronously load resources for extensions.
    
    Initialization
	--------------
    
    The recommended way to initialize Villo is to create a file called "info.villo.js". This file should be called after villo.js.
    	
    	<script type="text/javascript" src="villo.js"></script>
    	<script type="text/javascript" src="info.villo.js"></script>
    	
    This file should contain the call to villo.load, which will allow you to call Villo's APIs.
    
	Calling
	-------

	`villo.chat.join({room: string, callback: function, presence: {enabled: boolean})`
	
	- "Room" is the name of the chat room you want to join. Rooms are app-dependent.
	- The "callback" is called when a chat message is received. 
	- The "presence" object contains the "enabled" bool. Setting this to true opens up a presence channel, which tracks the users in a given chatroom. This can also be done with villo.chat.presence.join

	Returns
	-------
		
	Returns true if the chat room has successfully been subscribed to.
		
		
	Use
	---
		
		villo.chat.join({
			room: "main",
			callback: function(message){
				//The message variable is where the goods are.
			}
		});

*/
	villo.load = function(options){
		if (villo.isLoaded === true) {
			//Extensions
			if(options && typeof(options) === "object" && options.resources){
				for(x in options){
					//if(js){
					//	$script(js);
					//}else if(css){
					//	doCss(css);
					//}
				}
			}
		}else{
			//Initialization
			if (options.api) {
				villo.apiKey = options.api;
			}
			
			if (options.useCookies && options.useCookies == true) {
				villo.overrideStorage(true);
			}
			
			
			
			//Load up the settings (includes sync).
			if (store.get("VilloSettingsProp")) {
				villo.settings.load({
					callback: villo.doNothing()
				});
			}
			
			//Passed App Information
			villo.app.platform = options.platform;
			villo.app.title = options.title;
			villo.app.id = options.id;
			villo.app.version = options.version;
			villo.app.developer = options.developer;
			
			//Check login status.
			if (store.get("token.user") && store.get("token.token")) {
				villo.user.username = store.get("token.user");
				villo.user.token = store.get("token.token");
				//User Logged In
				villo.sync();
			} else {
			//User not Logged In
			}
			
			//Load pre-defined extensions. This makes adding them a breeze.
			if (options.extensions && (typeof(options.extensions == "object")) && options.extensions.length > 0) {
				var extensions = [];
				for (x in options.extensions) {
					if (options.extensions.hasOwnProperty(x)) {
						extensions.push(villo.script.get() + options.extensions[x]);
					}
				}
				$script(extensions, "extensions");
			} else if (options.include && (typeof(options.include == "object")) && options.include.length > 0) {
				var include = [];
				for (x in options.include) {
					if (options.include.hasOwnProperty(x)) {
						include.push(options.include[x]);
					}
				}
				$script(include, "include");
			} else {
				villo.doPushLoad(options);
			}
			
			$script.ready("extensions", function(){
				//Load up the include files
				if (options.include && (typeof(options.include == "object") && options.include.length > 0)) {
					var include = [];
					for (x in options.include) {
						if (options.include.hasOwnProperty(x)) {
							include.push(options.include[x]);
						}
					}
					$script(include, "include");
				} else {
					//No include, so just call the onload
					villo.doPushLoad(options);
				}
			});
			
			$script.ready("include", function(){
				villo.doPushLoad(options);
			});
		}
	};
	villo.doPushLoad = function(options){
		//Villo now loads the pubnub in it's dependencies file, and as such doesn't need to pull it in here, so we just call the onload function.
		if ("VILLO_SETTINGS" in window && typeof(VILLO_SETTINGS.ONLOAD == "function")) {
			VILLO_SETTINGS.ONLOAD(true);
		}
		villo.isLoaded = true;
	};
	//Override default storage options with a cookie option.
	villo.overrideStorage = function(doIt){
		if(doIt == true){
			store = {
				set: function(name, value, days){
					if (days) {
						var date = new Date();
						date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
						var expires = "; expires=" + date.toGMTString();
					} else {
						var expires = "";
					}
					document.cookie = name+"="+value+expires+"; path=/";
				},
				get: function(name){
					var nameEQ = name + "=";
					var ca = document.cookie.split(';');
					for(var i=0;i < ca.length;i++) {
						var c = ca[i];
						while (c.charAt(0) == ' ') {
							c = c.substring(1, c.length);
						}
						if (c.indexOf(nameEQ) == 0) {
							return c.substring(nameEQ.length, c.length);
						}
					}
					return null;
				},
				remove: function(name) {
					store.set(name,"",-1);
				}
			}
		}
	}
	
	/*
	 * Old Villo Init. This is outdated, and should not be used anymore. It's only included for the the sake of compatability, and doesn't do any of the cool tings that villo.load does.
	 * If you still call this function, please, stop.	 
	 */
	villo.init = function(options){
		if (options.api) {
			villo.apiKey = options.api;
		}
		
		if (options.useLegend) {
			villo.userLegend = false;
		}else{
			villo.userLegend = true;
		}
		
		//Push Chat requires a separate framework to load. We don't want to load it if we don't have to.
		if (options.pubnub && options.pubnub == true) {
			if (typeof(PUBNUB) == "undefined") {
				villo.log("Disabling push chat while we dynamically load the library.")
				villo.pushFramework = null;
				villo.loadFramework("pubnub");
			} else {
				villo.pushFramework = "pubnub";
			}
		}
		
		//For a future feature:
		if (options.mockData && options.mockData == true) {
			villo.app.mockData = true;
		}
		
		//Check to see if the user logged in, and if they did, load up their token.
		
		if (options.type == "mobile") {
			villo.app.platform = "mobile";
			if (Mojo.appInfo) {
				//Mojo
				villo.app.platform = "mojo";
				villo.app.id = Mojo.appInfo.id;
				villo.app.title = Mojo.appInfo.title;
				villo.app.version = Mojo.appInfo.version;
				villo.app.developer = Mojo.appInfo.vendor;
			} else if (typeof(enyo) != "undefined") {
				//Enyo
				villo.app.platform = "enyo";
				appInfo = enyo.fetchAppInfo();
				villo.app.id = appInfo.id;
				villo.app.title = appInfo.title;
				villo.app.version = appInfo.version;
				villo.app.developer = appInfo.vendor;
			} else {
				//Developer-set creds
				villo.app.id = options.appid;
				villo.app.title = options.apptitle;
				villo.app.version = options.appversion;
				villo.app.developer = options.appdeveloper;
			}
		} else if (options.type == "web") {
			villo.app.platform = "web";
			villo.app.id = options.appid;
			villo.app.title = options.apptitle;
			villo.app.version = options.appversion;
			villo.app.developer = options.appdeveloper;
		}
		
		//Load up the settings (includes sync).
		if (store.get("VilloSettingsProp")) {
			villo.settings.load({
				callback: villo.doNothing()
			});
		}
		
		if (store.get("token.user") && store.get("token.token")) {
			villo.user.username = store.get("token.user");
			villo.user.token = store.get("token.token");
			//User Logged In
			villo.sync();
			return 0;
		} else {
			//User not Logged In
			return 1;
		}
	}
})();
