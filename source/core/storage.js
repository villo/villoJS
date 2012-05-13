
/* Villo Cloud Storage */
villo.storage = {
	
	//TODO: Check to see if the string is JSON when we get it back.
	//TODO: Get callback values.
	
	set: function(addObject){
		//The managing of update vs new content is handled on the server
		if (!addObject.privacy) {
			addObject.privacy = false;
		}
		if (typeof(addObject.data) === "object") {
			//We'll be nice and stringify the data for them.
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
				if (transport !== "") {
					//Check for JSON:
					var trans = "";
					try{
						trans = JSON.parse(transport);
					}catch(e){
						trans = transport;
					}
					if(addObject.callback){
						addObject.callback(trans);
					}
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
				type: "retrieve",
				username: villo.user.username,
				token: villo.user.token,
				title: getObject.title,
				privacy: getObject.privacy
			},
			onSuccess: function(transport){
				if (transport !== "") {
					//Check for JSON
					var trans = "";
					try{
						trans = JSON.parse(transport);
					}catch(e){
						trans = transport;
					}
					getObject.callback(trans);
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
