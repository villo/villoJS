
/* Villo Public Feeds */
villo.feeds = {
/**
	villo.feeds.post
	================
	
    Posts a new entry in the public feeds.
    
    Calling
	-------

	`villo.feeds.post({action: string, description: string, reference: string, callback: function})`
    
    - The "action" is a string used by applications to differentiate between posts. Certain actions are reserved, and only posted by the Villo framework itself. For more details, see the "Actions" section below.
    - The "description" is a string that should describe what action is taking place.
    - The "reference" is a string that contains the universal post id of any posts that you wish to reference, separated by commas.
    - The "callback" is a function that will called after the post is added to the public feeds.
    
    Actions
    -------
    
    Actions aim to give developers an idea of what a post in the public feeds is about. Developers can define any action to differentiate posts from their own app, and handle the actions accordingly in the user interface.
    The default action is "user-post", and if no action is set, then this will be used.
	
	The following are reserved actions, and only posted by the Villo framework itself. Any post that attempts to use them will get prefixed with "custom-".
	
	- "leaders-submit"
	- "friend-add"
	- "profile-edit"
	- "app-launch"
	- "user-register"
	- "user-login"
	
	Additionally, the "villo-" prefix is reserved, and any post that attempts to use it will get prefixed with "custom-".
	
	All actions will be converted to lowercase.
    
    Mixins
    ------
    
    The "description" parameter supports three "mixins", where the API will automatically replace the content, allowing you to create more personalized descriptions.
    
    - #{username} will be replaced with the current user's username.
    - #{appname} will be replaced with the posting application's registered name on http://dev.villo.me.
    - #{appid} will be replaced with the posting application's registered appid on http://dev.villo.me.

	Callback
	--------
	
	If the post was successfully added to the public feeds, then true will be passed to the callback.
	
	Use
	---
	
		villo.feeds.post({
			action: "my-action",
			description: "I just triggered my-aciton on #{appname}.",
			reference: "1, 2, 3", //References can also be in an array like this: [1, 2, 3]
			callback: function(success){
				if(success){
					alert("Posting successful!");
				}
			}
		});
	
	Notes
	-----
	
	You can pass an array to the reference parameter, and it will automatically stringify it in the correct format.

*/
	post: function(pubObject){
		if(pubObject.reference && typeof(pubObject.reference) === "object"){
			pubObject.reference = pubObject.reference.join(", ");
		}
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
/**
	villo.feeds.get
	===============
	
    Gets a post in the public feeds by the universal post id.
    
    Calling
	-------

	`villo.feeds.get({id: string, callback: function})`
    
    - The "id" is a string that contains the universal feed id of any posts that you wish to reference. If you are retrieving more than one post, separate the numbers by commas.
    - The "callback" is a function that will called after the posts are retrieved.

	Callback
	--------
	
	An object will be passed to the callback. The object will be formatted like this. The "id" is the universal post id, used for referencing in villo.feeds.post, and villo.feeds.get.
	
		{"feeds": [
			{"id": "1", "action": "user-post", "reference": "", "username": "kesne", "description": "Hey guys, how is it going? This is the first post in the public feed! How exciting!", "appid": "me.villo.app", "timestamp": "1334546356357"},
			{"id": "5", "action": "my-action", "reference": ["1", "2", "3"], "username": "admin", "description": "I just triggered my-aciton on Villo.", "appid": "me.villo.website", "timestamp": "1334546665000"}
		]}
	
	Use
	---
	
		villo.feeds.get({
			id: "1, 2", //The post ids can also be in an array like this: [1, 2]
			callback: function(posts){
				//The variable "posts" contains an object with the first two posts on the public feed!
			}
		});
	
	Notes
	-----
	
	You can pass an array in the id parameter, and it will automatically stringified to the correct format.

*/
	get: function(getObject){
		if(getObject.id && typeof(getObject.id) === "object"){
			getObject.id = getObject.id.join(", ");
		}
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
/**
	villo.feeds.search
	==================
	
    Searches the public feed for a specific string.
    
    Calling
	-------

	`villo.feeds.search({term: string, limit: number, callback: function})`
    
    - The "term" is the string that you wish to search the public feed for. Only the descriptions of the posts will be searched.
    - The "limit" is a number which specifies the maximum number of posts to retrieve. This parameter defaults to 50, and is not required.
    - The "callback" is a function that will called after the posts are retrieved.

	Callback
	--------
	
	An object will be passed to the callback. The following might be the result when the term is set to "pizza".
	
		{"feeds": [
			{"id": "971", "action": "user-post", "reference": "", "username": "kesne", "description": "I just ate a pizza, it was great!", "appid": "me.villo.app", "timestamp": "1334546356357"},
			{"id": "225", "action": "pizza-app", "reference": "", "username": "admin", "description": "I just unlocked the Calorie badge on Pizza App!", "appid": "me.villo.pizza", "timestamp": "1334546665000"}
		]}
	
	Use
	---
	
		villo.feeds.search({
			term: "pizza",
			//Get up to 70 posts:
			limit: 70,
			callback: function(posts){
				//The variable "posts" contains posts containing "pizza"!
			}
		});
	
	Notes
	-----
	
	You can only search for posts on the public feed, and not on any app or user feeds.

*/
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
/**
	villo.feeds.history
	===================
	
    Gets the past updates posted in a specific feed.
    
    Calling
	-------

	`villo.feeds.history({type: string, limit: number, callback: function})`
    
    - The "type" is a string that contains the specific feed you wish to retrieve updates for. Feeds currently supports "public", and "friends". For more details, see the "Types" section below.
    - The "limit" is a number which specifies the maximum number of posts to retrieve. This parameter defaults to 50, and is not required.
    - The "callback" is a function that will called after the posts are retrieved.
    
    Types
    -----
    
    Feeds currently supports history for the "public" and "friends" feeds.
    
    - The "public" feed contains all posts ever posted on the Villo Public Feeds.
    - The "friends" feed contains the posts posted by the users who are currently friends with the user. For more details on friends, see villo.friends.get, villo.friends.add, and villo.friends.remove.

	Callback
	--------
	
	An object will be passed to the callback. The object will be formatted like this.
	
		{"feeds": [
			{"id": "5", "action": "my-action", "reference": ["1", "2", "3"], "username": "admin", "description": "I just triggered my-aciton on Villo.", "appid": "me.villo.website", "timestamp": "1334546360000"},
			{"id": "4", "action": "user-post", "reference": "", "username": "kesne", "description": "So... What does fourth get? ...", "appid": "me.villo.app", "timestamp": "1334546356000"},
			{"id": "3", "action": "user-post", "reference": "", "username": "kesne", "description": "Third is the one with the treasure chest! :D", "appid": "me.villo.app", "timestamp": "1334546355000"},
			{"id": "2", "action": "user-post", "reference": "", "username": "kesne", "description": "Second is the best! :)", "appid": "me.villo.app", "timestamp": "1334546353000"},
			{"id": "1", "action": "user-post", "reference": "", "username": "kesne", "description": "First is the worst! :(", "appid": "me.villo.app", "timestamp": "1334546351000"}
		]}
	
	Use
	---
	
		villo.feeds.history({
			//Get past posts from the user's friends:
			type: "friends",
			//Only get 5 posts:
			limit: 5,
			callback: function(posts){
				//The variable "posts" contains an object with the most recent 5 posts in the friends feed.
			}
		});
	
	Notes
	-----
	
	You can pass an array in the id parameter, and it will automatically stringified to the correct format.
	
	History retrieves posts in descending order, retrieving the most recent posts.

*/
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
/**
	villo.feeds.listen
	==================
	
    Listens for live updates in a specific public feed.
    
    Calling
	-------

	`villo.feeds.listen({type: string, username: string, appid: string, callback: function})`
    
    - The "type" is a string that contains the specific feed you wish to retrieve updates for. Listening currently supports "public", "user", and "app". For more details, see the "Types" section below.
    - The "username" is a string that contains the username of the user whose feed you wish to listen for updates in. This is only needed if the type is set to "user".
    - The "appid" is a string that contains the appid of the application that you wish to listen for new posts from. This is only needed if the type is set to "app".
    - The "callback" is a function that will called whenever there is a new post in the feed.
    
    Types
    -----
    
    Feeds currently supports live updates for the "public" feed, as well as user and app feeds.
    
    - The "public" feed contains all posts ever posted on the Villo Public Feeds.
    - A "user" feed contains the by a specific user. If you specify "user" as the type, you must also pass the username of the user's post you wish to listen to.
    - An "app" feed contains any posts made by a specific application. If you specify "app" as the type, you must also pass the appid of the application, as it is registered in the Villo Developer Portal.

	Callback
	--------
	
	An object will be passed to the callback whenever an update is posted to the feed. The object will be formatted like this.
	
		{"id": "5", "action": "my-action", "reference": ["1", "2", "3"], "username": "admin", "description": "I just triggered my-aciton on Villo.", "appid": "me.villo.website", "timestamp": "1334546360000"}
	
	Use
	---
	
		villo.feeds.history({
			//Listen to every post:
			type: "public",
			callback: function(post){
				//The variable "post" contains an object with a single update. This is called every time someone posts.
			}
		});

*/
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
		}else if(h.toLowerCase() === "app"){
			feedString += ("APPS/" + (listenObject.appid.toUpperCase() || villo.app.id));
		}
		
		PUBNUB.subscribe({
			channel: feedString,
			callback: function(data){
				listenObject.callback(data);
			}
		});
	},
	unlisten: function(){
		//TODO
	}
};
