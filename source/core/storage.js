
/* Villo Cloud Storage */
villo.storage = {
	
	//TODO: Check to see if the string is JSON when we get it back.
	//TODO: Get callback values.
	
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
					getObject.callback(33);
				}
			},
			onFailure: function(){
				getObject.callback(33);
			}
		});
	}
};
