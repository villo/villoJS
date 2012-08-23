
villo.storage = {
/**
	villo.storage.set
	=================
	
	Updates or adds data storage into Villo's cloud storage database.
    
	Calling
	-------

	`villo.storage.set({title: string, data: object, privacy: boolean, callback: function})`
	
	- The "title" string should be a name that you wish to reference the data by.
	- The "data" object is the actual data that you wish to store.
	- The "privacy" boolean lets you store data more securely on the server. When set to true, the data is stored on the database will be encrypted, and decrypted when it is retrieved with villo.storage.get. This defaults to false, and is optional.
	- The "callback" function is called when the the data has been set.

	Callback
	--------
		
	If the data was successfully set, then true will be passed to the callback function.
		
	Use
	---
		
		villo.storage.set({
			title: "test",
			data: {
				"hello": "world"
			},
			//Don't encrypt on the server:
			privacy: false,
			callback: function(success){
				//Check to see if the function worked:
				if(success === true){
					alert("The data has been set on the server!");
				}
			}
		});
		
	Notes
	-----
	
	All of the data stored in villo.storage is relative to the current user that is logged in to the application.
	
	The data stored using villo.storage does not have to be an object, although Villo will automatically stringify and parse object when setting and getting data.

*/
	set: function(addObject){
		if (!addObject.privacy) {
			addObject.privacy = false;
		}
		if (typeof(addObject.data) === "object") {
			//Stringify any JSON data for them. This will automatically be converted back into an object with get.
			addObject.data = JSON.stringify(addObject.data);
		}
		villo.ajax("https://api.villo.me/storage.php", {
			method: 'post',
			parameters: {
				//This is one hell of a beefy server call.
				api: villo.apiKey,
				appid: villo.app.id,
				app: villo.app.title,
				type: "store",
				username: villo.user.username,
				token: villo.user.token,
				privacy: addObject.privacy,
				title: addObject.title,
				data: addObject.data
			},
			onSuccess: function(transport){
				villo.verbose && console.log(transport);
				if (transport === "1") {
					addObject.callback(true);
				} else {
					addObject.callback(33);
				}
			},
			onFailure: function(){
				addObject.callback(33);
			}
		});
	},
/**
	villo.storage.get
	=================
	
	Gets data stored in Villo's cloud storage database.
    
	Calling
	-------

	`villo.storage.get({title: string, privacy: boolean, callback: function})`
	
	- The "title" string should be the name used when setting the data in villo.storage.set.
	- The "privacy" boolean should be set to true if you used privacy in villo.storage.set. This defaults to false, and is optional.
	- The "callback" function is called when the the data has been retrieved.

	Callback
	--------
		
	If the data was retrieved, it will be passed to the callback function. If any error occurs, then false will be passed to the callback function.
		
	Use
	---
		
		villo.storage.get({
			title: "test",
			//Only set to true if you did the same when setting the data:
			privacy: false,
			callback: function(data){
				if(data !== false){
					alert("We got the data!");
					//The data the you retrieved is now in the "data" variable.
				}
			}
		});
		
	Notes
	-----
	
	All of the data stored in villo.storage is relative to the current user that is logged in to the application.

*/
	get: function(getObject){
		if (!getObject.privacy) {
			getObject.privacy = false;
		}
		var storeGetTitle = villo.app.title;
		var storeGetAppID = villo.app.id;
		
		//TODO: Depreciate
		if (getObject.external) {
			storeGetTitle = getObject.external.appTitle;
			storeGetAppID = getObject.external.appID;
		}
		
		villo.ajax("https://api.villo.me/storage.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: storeGetAppID,
				app: storeGetTitle,
				type: "get",
				username: villo.user.username,
				token: villo.user.token,
				title: getObject.title,
				privacy: getObject.privacy
			},
			onSuccess: function(transport){
				villo.verbose && console.log(transport);
				if (transport !== "" && transport !== "0") {
					var trans = "";
					try{
						trans = JSON.parse(transport);
					}catch(e){
						trans = transport;
					}
					getObject.callback(trans);
				} else if(transport === "0"){
					getObject.callback(false);
				} else {
					//This used to be 33, generic database error
					villo.verbose && console.log("Error 33 - Generic Error: " + transport);
					getObject.callback(false);
				}
			},
			onFailure: function(){
				villo.verbose && console.log("onFailure storage.get error");
				getObject.callback(false);
			}
		});
	}
};
