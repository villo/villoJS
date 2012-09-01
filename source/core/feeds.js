
/* Villo Public Feeds */
villo.feeds = {
	post: function(pubObject){
		
		//
		// Channels: 
		// =========
		// 
		// VILLO/FEEDS/PUBLIC
		// VILLO/FEEDS/USERS/USERNAME
		// VILLO/FEEDS/APPS/APPID
		//
		//
		// Actions:
		// ========
		// 
		// Actions aim to give developers an idea of what the feed post is about. 
		// Developers can define any action to differentiate posts from their own app, and handle the actions accordingly.
		// The default action is "user-post".
		// The following are reserved actions, and any post that attempts to use them will get prefixed with "custom-".
		// 
		//	- "leaders-submit",
		//	- "friend-add",
		//	- "profile-edit",
		//	- "app-launch",
		//	- "user-register",
		//	- "user-login"
		// 
		// Additionally, the "villo-" prefix is reserved, and any post that attempts to use it will get prefixed with "custom-".
		// 
		// All actions will be converted to lowercase.
		//
		
		villo.ajax("https://api.villo.me/feeds.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				type: "post",
				username: villo.user.username,
				token: villo.user.token,
				description: pubObject.description,
				action: pubObject.action || "user-post",
				//Hybrid of @reply and re-posting:
				reference: pubObject.reference || ""
			},
			onSuccess: function(transport){
				console.log(transport);
				if(transport === "1"){
					//Successful:
					pubObject.callback(true);
				}else{
					pubObject.callback(33);
				}
			},
			onFailure: function(err){
				pubObject.callback(33);
			}
		});
	},
	get: function(getObject){
		villo.ajax("https://api.villo.me/feeds.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				type: "get",
				username: villo.user.username,
				token: villo.user.token,
				//Get multiple supported! Just add a comma!
				id: getObject.id
			},
			onSuccess: function(transport){
				try{
					var trans = JSON.parse(transport);
					getObject.callback(trans);
				}catch(e){
					getObject.callback(33);
				}
			},
			onFailure: function(err){
				getObject.callback(33);
			}
		});
	},
	search: function(searchObject){
		villo.ajax("https://api.villo.me/feeds.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				type: "search",
				username: villo.user.username,
				token: villo.user.token,
				limit: searchObject.limit || 50,
				term: searchObject.term
			},
			onSuccess: function(transport){
				try{
					transport = JSON.parse(transport);
				}catch(e){}
				
				if(transport && transport.feeds){
					//Successful:
					searchObject.callback(transport);
				}else{
					searchObject.callback(33);
				}
			},
			onFailure: function(err){
				searchObject.callback(33);
			}
		});
	},
	history: function(historyObject){
		villo.ajax("https://api.villo.me/feeds.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				type: "history",
				username: villo.user.username,
				token: villo.user.token,
				limit: historyObject.limit || 50,
				historyType: historyObject.type || "public",
				after: historyObject.after || false
			},
			onSuccess: function(transport){
				try{
					transport = JSON.parse(transport);
				}catch(e){}
				
				if(transport && transport.feeds){
					//Successful:
					historyObject.callback(transport);
				}else{
					historyObject.callback(33);
				}
			},
			onFailure: function(err){
				historyObject.callback(33);
			}
		});
	},
	listen: function(listenObject){
		//Get the string we want to use based on the type:
		var feedString = "VILLO/FEEDS/";
		if(!listenObject.type){
			listenObject.type = "public";
		}
		var h = listenObject.type;
		if(h.toLowerCase() === "public"){
			feedString += "PUBLIC";
		}else if(h.toLowerCase() === "user" || h.toLowerCase() === "username"){
			feedString += ("USERS/" + (listenObject.username.toUpperCase() || villo.user.getUsername().toUpperCase()));
		}else if(h.toLowerCase() === "apps"){
			feedString += ("APPS/" + (listenObject.appid.toUpperCase() || villo.app.id));
		}
		
		PUBNUB.subscribe({
			channel: feedString,
			callback: function(data){
				listenObject.callback(data);
			}
		});
	}
};
