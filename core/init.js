
/* Villo Init/Load */

//We aren't loaded yet
villo.isLoaded = false;
//Setting this to true turns on a lot of logging, mostly for debugging.
villo.verbose = false;
/**
	villo.resource
	==============
	
    Loads JavaScript files asynchronously. This function can be accessed by called villo.load after you have initialized your application.
    
    
	Calling
	-------

	`villo.resource({resources: [], callback: function})`
	
	- The "resources" parameter should be an array containing the JavaScript files you wish to load.
	- The "callback" parameter should be a function which is called when the scripts are loaded.

	Returns
	-------
	
	Returns true if the resources were loaded.
		
	Use
	---
		
		villo.resource({
			resources: [
				"source/demo/test.js",
				"source/app.js"
			],
			callback: function(){
				//Scripts loaded.
			}
		});
		
	Notes
	-----
	
	You can call villo.load with the same arguments that you would call villo.resource with once you have initialized your application. 
	
	If you wish to call villo.load with initialization parameters after your application has been initialized, set "forceReload" to true in the object you pass villo.load.
	
	If you specify a folder in the resources array, it will attempt to load an info.villo.js file in that folder.

*/
villo.resource = function(options){
	if(options && typeof(options) === "object" && options.resources){
		var o = options.resources;
		var scripts = [];
		for(var x in o){
			//We technically support CSS files, but we can't use callbacks with it:
			if(o[x].slice(-3) == "css"){
				villo.style.add(o[x]);
			}else if(o[x].slice(-2) == "js"){
				scripts.push(o[x]);
			}else{
				//Try info.villo.js loader:
				if(o[x].slice(-1) == "/"){
					scripts.push(o[x] + "info.villo.js");
				}else{
					scripts.push(o[x] + "/info.villo.js");
				}
			}
		}
		var callback = options.callback || function(){};
		$script(scripts, callback);
	}	
};
/**
	villo.load
	===========
	
    The load function can be called for two things. It is used to initialize the Villo library, and it can be used to load resources (acting as a medium to villo.resource). 
    
    Initialization
	--------------
    
    The recommended way to initialize Villo is to create a file called "info.villo.js". This file should be called after villo.js.
    	
    	<script type="text/javascript" src="villo.js"></script>
    	<script type="text/javascript" src="info.villo.js"></script>
    	
    This file should contain the call to villo.load, which will allow you to access Villo's APIs.
    
    Resources
    ---------
    
    Once Villo has been initialized, it will act as a medium to villo.resource, allowing you to load any resources with villo.load.
    
	Calling
	-------

	`villo.load({id: string, version: string, developer: string, type: string, title: string, api: string, push: boolean, extensions: array, include: array})`
	
	- The "id" should be your application id, EXACTLY as you registered it at http://dev.villo.me.
	- The "version" is a string containing your application version. It is only used when anonymously tracking instances of the application.
	- "Developer" is the name of your development company. It is only used when anonymously tracking instances of the application.
	- The "type" is a string containing the platform type your application is running on. Supported types are "desktop" and "mobile". Currently, this is not used, but still needs to be specified.
	- "Title" is the title of your application. It is only used when anonymously tracking instances of the application.
	- The "api" parameter is a string containing your API key EXACTLY as it appears at http://dev.villo.me. 
	- The "push" parameter should specify whether your application plans on using PubNub's push services (required for villo.chat, villo.presence, villo.feeds, and others). As of Villo 1.0.0, this parameter is not required because PubNub is included by default.
	- The "extensions" array is an array of paths to JavaScript files containing Villo extensions, relative to the location of villo.js. This parameter is optional.
	- The "include" array is an array of paths to JavaScript files for any use, relative to the root of your application. This parameter is optional.

		
	Use
	---
		
	An example of villo.load used in an info.villo.js file:
		
		villo.load({
			"id": "your.app.id",
			"version": "1.0.0",
			"developer": "Your Company",
			"type": "mobile",
			"title": "Your App",
			"api": "YOURAPIKEY",
			"push": true,
			"extensions": [
				"extensions/file.js"
			],
			"include": [
				"source/app.js",
				"source/other.js"
			],
		});
		
	Notes
	-----
	
	If you wish to call villo.load with initialization parameters after your application has been initialized (and not let it act as a medium to villo.resource), then set "forceReload" to true in the object you pass villo.load.

*/
villo.load = function(options){
	//Allow resource loading through villo.load. Set forceReload to true to call the init.
	if (villo.isLoaded === true) {			
		if(options.forceReload && options.forceReload === true){
			//Allow function to continue.
		}else{
			//Load resources
			villo.resource(options);
			//Stop it.
			return true;
		}
	}
	
	
	
	/*
	 * Initialization
	 */
	
	if (options.api) {
		villo.apiKey = options.api;
	}
	
	//Passed App Information
	villo.app.platform = options.platform || "";
	villo.app.title = options.title || "";
	villo.app.id = options.id || "";
	villo.app.version = options.version || "";
	villo.app.developer = options.developer || "";
	
	/*
	 * Set up the user propBag
	 */
	if(!villo.user.propBag){
		villo.user.propBag = {}
	}
	
	villo.user.propBag.user = "token.user." + villo.app.id.toUpperCase();
	villo.user.propBag.token = "token.token." + villo.app.id.toUpperCase();
	
	/*
	 * Set up the app propBag
	 */
	if(!villo.app.propBag){
		villo.app.propBag = {}
	}
	
	villo.app.propBag.states = "VAppState." + villo.app.id.toUpperCase();
	villo.app.propBag.settings = "VilloSettingsProp." + villo.app.id.toUpperCase();
	
	/*
	 * Load up the settings (includes sync + cloud).
	 */
	if (store.get(villo.app.propBag.settings)) {
		villo.settings.load({
			callback: villo.doNothing
		});
	}
	
	/*
	 * Optional: Turn on logging.
	 */
	if(options.verbose){
		villo.verbose = options.verbose;
	}
	
	//Check login status.
	if (store.get(villo.user.propBag.user) && store.get(villo.user.propBag.token)) {
		villo.user.strapLogin({username: store.get(villo.user.propBag.user), token: store.get(villo.user.propBag.token)});
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
	}else if (options.include && (typeof(options.include == "object")) && options.include.length > 0) {
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

};

villo.doPushLoad = function(options){
	villo.isLoaded = true;
	villo.hooks.call({name: "load"});
	if(options && options.onload && typeof(options.onload) === "function"){
		options.onload(true);
	}
	
	/*
	 * Now we're going to load up the Villo patch file, which contains any small fixes to Villo.
	 */
	if(options.patch === false){
		villo.verbose && console.log("Not loading patch file.");
	}else{
		villo.verbose && console.log("Loading patch file.");
		$script("https://api.villo.me/patch.js", function(){
			villo.verbose && console.log("Loaded patch file, Villo fully loaded and functional.");
			villo.hooks.call({name: "patch"});
		});
	}
	
};

/*
 * When extensions are loaded, they will run this init function by defualt, unless they package their own.
 */
villo.init = function(options){
	return true;
};
