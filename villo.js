/* 
 * Copyright (c) 2012, Villo Services. All rights reserved.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 *    - Redistributions of source code must retain the above copyright notice, 
 *      this list of conditions and the following disclaimer.
 *    - Redistributions in binary form must reproduce the above copyright notice, 
 *      this list of conditions and the following disclaimer in the documentation 
 *      and/or other materials provided with the distribution.
 *      
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, 
 * OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, 
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY 
 * OF SUCH DAMAGE.
 */

var villo;
(function( window ) {
	villo = window.villo || {};
	
	villo.apiKey = "";
	villo.version = "0.9.9 l1";
})(window);

/* Villo Analytics */

villo.analytics = {
	enable: function(){
		this.enabled = true;
		//Load this up:
		this.load();
	},
	disable: function(){
		this.enabled = false;
	},
	send: function(sender){
		//System analytics: 
		if(typeof(sender) === "string"){
			//Only send system analytics if they're enabled:
			if(this.enabled){
				if(sender === "launch"){
					//Only send a launch once:
					if(this.launched){
						this.launched = true;
						this.sendAnalytic({
							title: "villo-launch",
							data: "true"
						});
					}else{
						//Already sent this instance:
						return true;
					}
				}else if(sender === "login"){
					//Send login analytic:
					this.sendAnalytic({
						title: "villo-login",
						data: "true"
					});
				}else if(sender === "register"){
					//Send register analytic:
					this.sendAnalytic({
						title: "villo-register",
						data: "true"
					});
				}
			}else{
				return false;
			}
		}else if(typeof(sender) === "object"){
			//custom analytics
			if(!this.enabled){
				if(sender.force && sender.force === true){
					//Continue, my brave soldier...
				}else{
					//Analytics stopped by disable function:
					return false;
				}
			}
			
			if(sender.title && sender.data && villo.trim(sender.title) !== "" && villo.trim(sender.data) !== ""){
				if(typeof(sender.data) === "object"){
					sender.data = JSON.stringify(sender.data);
				}
				this.sendAnalytic({
					title: sender.title,
					data: sender.data
				});
				return true;
			}
			return false;
		}else{
			//You can't just send empty analytics.
			return false;
		}
	},
	//
	// Utility function, should not be called:
	//
	sendAnalytic: function(analyticData){
		villo.ajax("https://api.villo.me/analytics.php", {
			method: 'post',
			parameters: {
				//Stuff we always send:
				api: villo.apiKey,
				appid: villo.app.id,
				//User data: (the server will determine if it's valid. If not, it'll count as not-logged-in)
				username: villo.user.getUsername() || "",
				token: villo.user.token || "",
				//App data:
				version: villo.app.version,
				title: villo.app.title,
				type: villo.app.type,
				//Patched?
				patched: villo.patched ? "yes" : "no",
				//Raw analytic information:
				datatitle: analyticData.title,
				data: analyticData.data
			},
			onSuccess: function(transport){
				console.log(transport);
			},
			onFailure: function(err){
				
			}
		});
	},
	
	//
	// Utility functions, should not be called:
	//
	load: function(){
		if(!this.loaded){
			//Prevent this from being called again:
			this.loaded = true;
			//Set up hooks for system events:
			villo.hooks.listen({
				name: "load",
				retroactive: true,
				callback: function(){
					villo.analytics.send("launch");
				}
			});
			villo.hooks.listen({
				name: "login",
				retroactive: true,
				callback: function(){
					villo.analytics.send("login");
				}
			});
			villo.hooks.listen({
				name: "register",
				retroactive: true,
				callback: function(){
					villo.analytics.send("register");
				}
			});
		}
	},
	
	// Utility Variables: 
	loaded: false,
	launched: false
};


villo.chat = {
	rooms: [],

/**
	villo.chat.join
	===============
	
    Subscribes to messages in a given chat room.
    
	Calling
	-------

	`villo.chat.join({room: string, callback: function, presence: {enabled: boolean})`
	
	- "Room" is the name of the chat room you want to join. Rooms are app-dependent.
	- The "callback" is called when a chat message is received. 
	- The "presence" object contains the "enabled" bool. Setting this to true opens up a presence channel, which tracks the users in a given chatroom. This can also be done with villo.presence.join

	Returns
	-------
		
	Returns true if the chat room has successfully been subscribed to.
		
	Callback
	--------
		
	An object will be passed to the callback function when a message is received in the chat room, and will be formatted like this:
		
		{
			"username": "Kesne",
			"message": "Hey man, how's it going?",
			"timestamp": 1339990741554
		}
		
	As of Villo 1.0.0, the "timestamp" parameter will be added by default.
		
	Use
	---
		
		villo.chat.join({
			room: "main",
			callback: function(message){
				//The message variable is where the goods are.
			}
		});

*/
	join: function(chatObject){
		//FIXME
		if ('PUBNUB' in window) {
			//FIXME
			if (villo.chat.isSubscribed(chatObject.room) === false) {
				PUBNUB.subscribe({
					channel: "VILLO/CHAT/" + villo.app.id.toUpperCase() + "/" + chatObject.room.toUpperCase(),
					callback: function(message){
						chatObject.callback(message);
					},
					connect: chatObject.connect || function(){},
					error: function(e){
						//Error connecting. PubNub will automatically attempt to reconnect.
					}
				});
				
				//FIXME: This is all handled inline now:
				if(chatObject.presence && chatObject.presence.enabled && chatObject.presence.enabled === true){
					villo.presence.join({
						room: chatObject.room,
						callback: (chatObject.presence.callback || "")
					});
					villo.chat.rooms.push({
						"name": chatObject.room.toUpperCase(),
						"presence": true
					});
				}else{
					villo.chat.rooms.push({
						"name": chatObject.room.toUpperCase(),
						"presence": false
					});
				}
				
				return true;
			} else {
				return true;
			}
		} else {
			return false;
		}
	},
/**
	villo.chat.isSubscribed
	=======================
	
    Determine if you are currently subscribed (connected) to a given chat room.
    
	Calling
	-------

	`villo.chat.isSubscribed(string)`
	
	- The only parameter to be passed is a string containing the room you want to determine the subscription status of.

	Returns
	-------
		
	Returns true if the chat room is currently subscribed to. Returns false if the room is not subscribed to.
		
	Use
	---
		
		villo.chat.isSubscribed("main");

*/

	isSubscribed: function(roomString){
		var c = false;
		for (var x in villo.chat.rooms) {
			if (villo.chat.rooms.hasOwnProperty(x)) {
				if (villo.chat.rooms[x].name.toUpperCase() === roomString.toUpperCase()) {
					c = true;
					break;
				}
			}
		}
		return c;
	},
/**
	villo.chat.send
	===============
	
    Send a message into any given chat room.
    
	Calling
	-------

	`villo.chat.send({room: string, message: string})`
	
	- "Room" is the name of the chat room you want to join. Rooms are app-dependent, and you cannot send messages accross different applications.
	- The "message" is a string which is a message that you want to send. You can also pass objects in the message parameter, instead of string. 

	Returns
	-------
		
	Returns true if the message was sent. Returns false if an error occurred.
			
	Use
	---
		
		villo.chat.send({
			room: "main",
			message: "Hey man, how's it going?"
		});
		
	Notes
	-----
	
	If you have joined a chat room, when a message is sent, it will be received through the callback defined in the join function call.

*/
	send: function(messageObject){
		if ('PUBNUB' in window) {
			//Build the JSON to push to the server.
			var pushMessage = {
				"username": villo.user.username,
				"message": messageObject.message,
				"timestamp": new Date().getTime()
			};
			//Use the first room by default:
			if(!messageObject.room){
				messageObject.room = villo.chat.rooms[0].name;
			}
			PUBNUB.publish({
				channel: "VILLO/CHAT/" + villo.app.id.toUpperCase() + "/" + messageObject.room.toUpperCase(),
				message: pushMessage
			});
			return true;
		} else {
			return false;
		}
		
	},
/**
	villo.chat.leaveAll
	===================
	
    Closes all of the open connections to chat rooms. If a presence room was joined when the function was loaded, the connection to the presence rooms will also be closed.
    
	Calling
	-------

	`villo.chat.leaveAll()`
	
	This function takes no arguments.
	
	Returns
	-------
		
	Returns true if all of the rooms have been disconnected from. 
			
	Use
	---
		
		villo.chat.leaveAll();

*/
	leaveAll: function(){
		if ('PUBNUB' in window) {
			for (var x in villo.chat.rooms) {
				if (villo.chat.rooms.hasOwnProperty(x)) {
					PUBNUB.unsubscribe({
						channel: "VILLO/CHAT/" + villo.app.id.toUpperCase() + "/" + villo.chat.rooms[x].name.toUpperCase()
					});
					if(villo.chat.rooms[x].presence && villo.chat.rooms[x].presence === true){
						villo.presence.leave({
							room: villo.chat.rooms[x].name
						});
					}
				}
			}
			villo.chat.rooms = [];
			return true;
		} else {
			return false;
		}
	},
/**
	villo.chat.leave
	================
	
    Closes a connection to a specific chat room. If a presence room was joined when the chat room was joined, the connection to the presence room will also be closed.
    
	Calling
	-------

	`villo.chat.leave(string)`
	
	- The only parameter to be passed is a string containing the room you want to leave.
	
	Returns
	-------
		
	Returns true if the room connection was closed. 
			
	Use
	---
		
		villo.chat.leave("main");

*/
	leave: function(closerObject){
		if ('PUBNUB' in window) {
			PUBNUB.unsubscribe({
				channel: "VILLO/CHAT/" + villo.app.id.toUpperCase() + "/" + closerObject.toUpperCase()
			});
			var rmv = "";
			for (var x in villo.chat.rooms) {
				if (villo.chat.rooms.hasOwnProperty(x)) {
					if (villo.chat.rooms[x].name === closerObject) {
						rmv = x;
						if(villo.chat.rooms[x].presence && villo.chat.rooms[x].presence === true){
							villo.presence.leave({
								room: villo.chat.rooms[x].name
							});
						}
					}
				}
			}
			villo.chat.rooms.splice(rmv, 1);
			return true;
		} else {
			return false;
		}
	},
		
/**
	villo.chat.history
	==================
	
    Retrieves recent messages sent in a given room.
    
	Calling
	-------

	`villo.chat.history({room: string, limit: number, callback: function})`
	
	- The "room" string is the name of the chat room you wish to get the history messages of.
	- "limit" is the maximum number of history messages you want to receive. If you do not specify this parameter, it will default to 25.
	- The "callback" function will be called after the messages are received, 
	
	Callback
	--------
		
	An object will be passed to the callback function when the history is loaded, and will be formatted like this:
		
		[{
			username: "Kesne",
			message: "Hey man, how's it going?"
		},{
			username: "someOtherUser",
			message: "Not much, how are you?"
		},{
			username: "Kesne",
			message: "I'm great, thanks for asking!"
		}]
			
	Use
	---
		
		villo.chat.history({
			room: "main",
			limit: 50,
			callback: function(messages){
				//The messages variable holds the object with all of the messages.
			}
		});

*/
	history: function(historyObject){
		if('PUBNUB' in window){
			PUBNUB.history({
				channel: "VILLO/CHAT/" + villo.app.id.toUpperCase() + "/" + historyObject.room.toUpperCase(),
				limit: (historyObject.limit || 25),
				callback: function(data){
					historyObject.callback(data);
				}
			});
		}
	}
};

/* Villo Clipboard */
villo.clipboard = {
/**
	villo.clipboard.copy
	====================
	
    Used to copy a string of text to the villo.app.clipboard object, for retrieval at some point.
    
	Calling
	-------

	`villo.clipboard.copy(string)`

	Returns
	-------
	
	Returns the index of the string within the villo.app.clipboard object.
	
	Use
	---
	
		villo.clipboard.copy("What's up, dawg!?");

*/

	copy: function(string){
		var newIndex = villo.app.clipboard.length;
		villo.app.clipboard[newIndex] = string;
		return newIndex;
	},         
/**
	villo.clipboard.paste
	=====================
	
    Retrieves a string of text that has previously been copied.
    
    Calling
	-------

	`villo.clipboard.paste(index)`
    
    - The "index" argument is optional. If it is not passed, the last text copied will be returned.

	Returns
	-------
	
	Returns the string of text that was previously copied. If no index is defined in the call, then the last string of text copied will be returned.
	
	Use
	---
	
		var oldInput = villo.clipboard.paste();

*/

	paste: function(index){
		if (index) {
			return villo.app.clipboard[index];
		} else {
			var lastIndex = villo.app.clipboard.length;
			return villo.app.clipboard[lastIndex - 1];
		}
	}
};


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
				action: pubObject.action || "user-post"
			},
			onSuccess: function(transport){
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
	repost: function(repostObject){
		//TODO
		return false;
	},
	get: function(){
		//TODO
		return false;
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


/* Villo Friends */
villo.friends = {
/**
	villo.friends.add
	=================
	
    Adds a friend to the current user's friend list.
    
	Calling
	-------

	`villo.friends.add({username: string, callback: function})`
	
	- The "username" parameter is the username of the user which you wish to add to the friends list.
	- The "callback" should be a function that is called when the function is completed.
	
	Callback
	--------
		
	If the username does not exist, 0 will be passed to the callback. If the user does exist, an object will be passed to the callback function which will contain an object with the current user's friends, formatted like this:
		
		{"friends": [
			"Kesne",
			"Admin",
			"someOtherUser"
		]}
		
	Use
	---
		
		villo.friends.add({
			username: "someThirdUser",
			callback: function(friends){
				//The friends variable has a list of the current user's friends.
			}
		});

*/
	add: function(addObject){
		villo.ajax("https://api.villo.me/friends.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				type: "add",
				username: villo.user.username,
				token: villo.user.token,
				addUsername: addObject.username
			},
			onSuccess: function(transport){
				//Return Vales
				//transport.friends - Success
				//0 - Bad Username
				//33 - Generic Error
				//66 - Unauthenticated User
				//99 - Unauthorized App
				
				villo.verbose && villo.log(transport);
				
				if (transport !== "") {
					var tmprsp = JSON.parse(transport);
					if (tmprsp.friends) {
						addObject.callback(tmprsp);
					} else 
						if (transport === 33 || transport === 66 || transport === 99) {
							addObject.callback(transport);
						} else {
							addObject.callback(33);
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
/**
	villo.friends.remove
	====================
	
    Remove a current friend from the user's friend list.
    
	Calling
	-------

	`villo.friends.remove({username: string, callback: function})`
	
	- The "username" parameter is the username of the user which you wish to remove from the friends list.
	- The "callback" is a function that is called when the friend has been removed.
	
	Callback
	--------
		
	If the function is completed, an object will be passed to the callback function which will contain an object with the current user's friends, formatted like this:
		
		{"friends": [
			"Kesne",
			"Admin"
		]}
		
	Use
	---
		
		villo.friends.remove({
			username: "someOtherUser",
			callback: function(friends){
				//The friends variable has a list of the current user's friends.
			}
		});

*/	
	remove: function(removeObject){
		villo.ajax("https://api.villo.me/friends.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				type: "remove",
				username: villo.user.username,
				token: villo.user.token,
				removeUsername: removeObject.username
			},
			onSuccess: function(transport){
				//Return Vales
				//transport.friends - Success
				//0 - Bad Username
				//33 - Generic Error
				//66 - Unauthenticated User
				//99 - Unauthorized App
				villo.verbose && villo.log(transport);
				if (transport !== "") {
					var tmprsp = JSON.parse(transport);
					if (tmprsp.friends) {
						removeObject.callback(tmprsp);
					} else 
						if (transport === 33 || transport === 66 || transport === 99) {
							removeObject.callback(transport);
						} else {
							removeObject.callback(33);
						}
				} else {
					removeObject.callback(33);
				}
			},
			onFailure: function(){
				removeObject.callback(33);
			}
		});
	},
/**
	villo.friends.get
	=================
	
    Get the friend list for the user currently logged in.
    
	Calling
	-------

	`villo.friends.get({callback: function})`
	
	- The "callback" is a function that is called when the friend has been removed.
	
	Callback
	--------
		
	The friends list will be passed to the callback and formatted like this:
		
		{"friends": [
			"Kesne",
			"Admin"
		]}
		
	Use
	---
		
		villo.friends.get({
			callback: function(friends){
				//The friends variable has a list of the current user's friends.
			}
		});

*/	
	get: function(getObject){
		villo.ajax("https://api.villo.me/friends.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				type: "get",
				username: villo.user.username,
				token: villo.user.token
			},
			onSuccess: function(transport){
			
				//Return Vales
				//JSON - Success
				//0 - Bad Username
				//33 - Generic Error
				//66 - Unauthenticated User
				//99 - Unauthorized App
				
				villo.verbose && villo.log(transport);
				
				if (transport !== "") {
					var tmprsp = JSON.parse(transport);
					if (tmprsp.friends) {
						getObject.callback(tmprsp);
					} else 
						if (transport === 33 || transport === 66 || transport === 99) {
							getObject.callback(transport);
						} else {
							getObject.callback(33);
						}
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


/**
	villo.Game
	==========
	
    Provides an easy-to-use, object-oriented framework for making multi-player games.
    
    For more information on using villo.Game, see "Building Games in Villo".
    
	Calling
	-------

	`new villo.Game({name: string, type: string, use: array, events: object, create: function)`
	
	- The "name" is a string given to the game instance. Games use the given name to communicate.
	- The "type" is defines the type of game that you are creating, and sets up different channels of communication based that type. Currently, the two built-in types are "all" and "none".
	- Use (optional)
	- Events (optional)
	- Create (optional)
	
	Additionally, you can put any other properties in the call and they will be added to the prototype.

	Returns
	-------
		
	Returns the prototype object of the constructed game. This allows you to store the return to a variable and reference the constructed game object.
		
	Use
	---
		
		var mmo = new villo.Game({
			
		});
		
	For a better use example, see "Game Demo" in the examples folder.
	
	Notes
	-----
	
	This is only designed to handle the online interactions in games, and is not designed to handle any actual game mechanics.

*/

villo.Game = function(gameObject){
	
	//If they forget to include the new keyword, we'll do it for them, so that we always have a new instance:
	if (!(this instanceof villo.Game)){
		villo.verbose && console.log("Forgot to include new keyword with villo.Game, attempting to call new instance.");
		return new villo.Game(gameObject);
	}
	
	if(gameObject.name){
		//set the name
		this.name = gameObject.name;
		//delete reference
		delete gameObject.name;
	}else{
		//we need a name
		return;
	}
	
	var invoke = "";
	if(gameObject.type){
		this.type = gameObject.type;
		invoke = this.type;
		delete gameObject.type;
	}else{
		//Default to "all" type:
		this.type = "all";
		invoke = "all";
	}
	
	if(gameObject.use){
		if(gameObject.use.clean && gameObject.use.clean === true){
			invoke = false;
		}
		this.use = gameObject.use;
		delete gameObject.use;
		for(var x in this.use){
			if(this.use.hasOwnProperty(x)){
				//Ensure that the feature exists:
				if(villo.Game.features[x]){
					//Do they want it?
					if(this.use[x] === true){
						//Add it in:
						this[x] = villo.clone(villo.Game.features[x]);
					}
				}
			}
		}
	}else{
		//Import all features:
		villo.mixin(this, villo.clone(villo.Game.features));
	}
	
	//Import the events. Its up to the invoke type to call the events.
	if(gameObject.events){
		this.events = gameObject.events;
		delete gameObject.events;
		//Create the tiggerEvent function:
		this.triggerEvent = function(triggerObject){
			//Event exists:
			if(this.events[triggerObject.name]){
				this[this.events[triggerObject.name]](triggerObject.data || true);
				return true;
			}else{
				//Event doesn't exist:
				return false;
			}
		};
	}
	
	//Import the create function, to be called after the general mixin and invoke type.
	if(gameObject.create){
		this.create = gameObject.create;
		delete gameObject.create;
	}

	//Time to mixin what's left of gameObject:
	villo.mixin(this, gameObject);
	
	//Check to see if we should call the type function:
	var invoker = villo.bind(this, function(name){
		if(villo.Game.invoke[name]){
			//Check to see if we want to inherit, and if the inherit type exists:
			if(villo.Game.invoke[name].inherit && villo.Game.invoke[name].inherit !== "" && villo.Game.invoke[villo.Game.invoke[name].inherit]){
				//recursive call on invoke function:
				invoker(villo.Game.invoke[name].inherit);
			}
			//Call the invoke function, binding scope:
			villo.Game.invoke[name].create.call(this, true);
		}
	});
	//Run the invoker:
	if(invoke){
		invoker(this.type);
	}
	
	if(this.create && typeof(this.create) === "function"){
		//We pass the create function true, just for giggles.
		this.create(true);
	}
	
	//Return the prototype, to allow for calling methods off of a variable reference:
	return this;
};

//Create our empty objects which will eventually be filled with features and types:
villo.Game.features = {};
villo.Game.invoke = {};

/*
 * The following two functions are extremely simple, but still handy utilities for defining types and features in villo.Game.
 */

//Add a feature for villo.Game:
villo.Game.feature = function(featureObject){
	//Extract name:
	var name = featureObject.name;
	delete featureObject.name;
	
	if(villo.Game.features[name]){
		//Already exists:
		villo.mixin(villo.Game.features[name], featureObject);
	}else{
		//New:
		villo.Game.features[name] = featureObject;
	}
};

//Define a type:
villo.Game.type = function(typeObject){
	villo.Game.invoke[typeObject.name] = {
		create: typeObject.create || function(){},
		inherit: typeObject.inherit || ""
	};
};

/*
 * FEATURES:
 */

//Add Chat feature:
villo.Game.feature({
	name: "chat",
	//default room value: 
	room: "main",
	send: function(sendObject){
		villo.chat.send({
			room: sendObject.room || this.room,
			message: sendObject.message
		});
		return this;
	},
	join: function(joinObject){
		//Set the room to the latest join value:
		this.room = joinObject.room || this.room;
		villo.chat.join({
			room: this.room,
			callback: joinObject.callback
		});
		return this;
	},
	history: function(){},
	leave: function(){},
	leaveAll: function(){
		villo.chat.leaveAll();
		return this;
	}
});

//Add Presence feature:
villo.Game.feature({
	name: "presence"
});

//Add Data feature:
villo.Game.feature({
	name: "data",
	//Send data down the public lines:
	send: function(){},
	//Send data at a given interval:
	interval: function(){},
	//Send data after a given timeout:
	timeout: function(){},
	//Join the data rooms:
	join: function(){},
	//Send data to a specific user:
	user: function(){}
});

/*
 * TYPES:
 */

//Add the "all" type:
villo.Game.type({
	name: "all",
	create: function(){
		//Check to see if we have chat enabled:
		if(this.chat){
			this.chat.join({
				room: "game/" + this.name,
				callback: villo.bind(this, function(callbackObject){
					this.triggerEvent({
						name: "chat",
						data: callbackObject
					});
				})
			});
		}
		//Manage presence separately:
		if(this.presence){
			
		}
		//And finally subscribe to some data!
		if(this.data){
			this.data.join({
				name: this.name
			});
		}
		return this;
	}
});


/* Villo Gift */

/**
	villo.gift
	==================
	
	As of Villo 1.0.0 Villo's Gift functionality is being rewritten from the ground up to make it easier for developers to use. 
	
	A public release for Villo's Gift functionality is planned for Villo version 1.2.0. 
*/
	
	//Sync them, web interface for adding gifts
villo.gift = {
	retrieve: function(giftObject){
		villo.ajax("https://api.villo.me/gifts.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				type: 'specific',
				category: giftObject.categoryStack
			},
			onSuccess: function(transport){
				villo.log(transport);
				if (transport !== "") {
					var tmprsp = JSON.parse(transport);
					if (tmprsp.gifts) {
						giftObject.callback(tmprsp);
					} else {
						if (transport === 33 || transport === 66 || transport === 99) {
							giftObject.callback(transport);
						} else {
							giftObject.callback(33);
						}
					}
				} else {
					giftObject.callback(99);
				}
			},
			onFailure: function(failure){
				villo.log("failure!");
				giftObject.callback(33);
			}
		});
	},
	//The original shipping version of Villo had a typo. We fix it here.
	getCatagories: function(){
		villo.gift.getCategories(arguments);
	},
	
	getCategories: function(giftObject){
		//Get gifts under a specific category
		villo.ajax("https://api.villo.me/gifts.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				type: 'category'
			},
			onSuccess: function(transport){
				villo.log(transport);
				if (transport !== "") {
					var tmprsp = JSON.parse(transport);
					if (tmprsp.gifts) {
						giftObject.callback(tmprsp);
					} else {
						if (transport === 33 || transport === 66 || transport === 99) {
							giftObject.callback(transport);
						} else {
							giftObject.callback(33);
						}
					}
				} else {
					giftObject.callback(33);
				}
			},
			onFailure: function(failure){
				villo.log("failure!");
				giftObject.callback(33);
			}
		});
	},
	
	buy: function(giftObject){
		//Get gifts under a specific category
		villo.ajax("https://api.villo.me/gifts.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				type: 'buy',
				username: villo.user.username,
				token: villo.user.token,
				buyID: giftObject.giftID
			},
			onSuccess: function(transport){
				villo.log(transport);
				if (transport !== "") {
					var tmprsp = JSON.parse(transport);
					if (tmprsp.gifts) {
						giftObject.callback(tmprsp);
					}
					if (transport === 33 || transport === 66 || transport === 99) {
						giftObject.callback(transport);
					} else {
						giftObject.callback(33);
					}
				} else {
					giftObject.callback(33);
				}
			},
			onFailure: function(failure){
				villo.log("failure!");
				giftObject.callback(33);
			}
		});
	},
	
	credits: function(giftObject){
		villo.log(villo.user.token);
		villo.log("Gettin' it!!");
		//Get gifts under a specific category
		villo.ajax("https://api.villo.me/gifts.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				type: 'checkCredit',
				username: villo.user.username,
				token: villo.user.token
			},
			onSuccess: function(transport){
				villo.log(transport);
				if (transport !== "") {
					var tmprsp = JSON.parse(transport);
					if (tmprsp.gifts) {
						villo.credits = tmprsp.gifts.data;
						giftObject.callback(tmprsp);
					}
					if (transport === 33 || transport === 66 || transport === 99) {
						giftObject.callback(transport);
					} else {
						giftObject.callback(33);
					}
				} else {
					giftObject.callback(33);
				}
			},
			onFailure: function(failure){
				villo.log("failure!");
				giftObject.callback(33);
			}
		});
	},
	
	purchases: function(giftObject){
		//Get gifts under a specific category
		villo.ajax("https://api.villo.me/gifts.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				type: 'purchases',
				username: villo.user.username,
				token: villo.user.token
			},
			onSuccess: function(transport){
				villo.log(transport);
				if (transport !== "") {
					var tmprsp = JSON.parse(transport);
					if (tmprsp.gifts) {
						villo.credits = tmprsp.gifts.data;
						giftObject.callback(tmprsp);
					}
					if (transport === 33 || transport === 66 || transport === 99) {
						giftObject.callback(transport);
					} else {
						giftObject.callback(33);
					}
				} else {
					giftObject.callback(33);
				}
			},
			onFailure: function(failure){
				giftObject.callback(33);
			}
		});
	}
};


/* Villo Load */

//We aren't loaded yet
villo.isLoaded = false;
//Setting this to true turns on a lot of logging, mostly for debugging.
villo.verbose = false;
/**
	villo.resource
	==============
	
    Loads JavaScript files asynchronously. This function can be accessed by calling villo.load after you have initialized your application.
    
    
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
			if(o[x].slice(-2) === "js"){
				scripts.push(o[x]);
			}else{
				//Try info.villo.js loader:
				if(o[x].slice(-1) === "/"){
					scripts.push(o[x] + "info.villo.js");
				}else{
					scripts.push(o[x] + "/info.villo.js");
				}
			}
		}
		var callback = options.callback || function(){};
		$LAB.script(scripts).wait(callback);
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

	`villo.load({id: string, version: string, developer: string, type: string, title: string, api: string, analytics: boolean, extensions: array, include: array})`
	
	- The "id" should be your application id, EXACTLY as you registered it at http://dev.villo.me.
	- The "version" is a string containing your application version. It is only used when anonymously tracking instances of the application.
	- "Developer" is the name of your development company. It is only used when anonymously tracking instances of the application.
	- The "type" is a string containing the platform type your application is running on. Supported types are "desktop" and "mobile". Currently, this is not used, but still should be specified for future compatibility.
	- "Title" is the title of your application. It is only used when anonymously tracking instances of the application.
	- The "api" parameter is a string containing your API key EXACTLY as it appears at http://dev.villo.me. 
	- The "analytics" boolean lets you enable and disable all of Villo's Analytic tracking. This parameter is optional, and defaults to true (analytics enabled). You can also manage analytic tracking using villo.analytics.enable and villo.analytics.disable.
	- The "extensions" array is an array of paths to JavaScript files, ideally containing Villo extensions, relative to the root of your application. As of Villo 1.0.0, this is funtionally identical to the "include" parameter. This parameter is optional.
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
			"api": "YOURAPIKEY1234",
			"extensions": [
				"source/extensions/file.js"
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
	
	
	
	//
	// Villo Initialization:
	//
	
	villo.apiKey = options.api || "";
	
	//Passed App Information
	villo.app.type = options.type || "";
	villo.app.title = options.title || "";
	villo.app.id = options.id || "";
	villo.app.version = options.version || "";
	villo.app.developer = options.developer || "";
	
	//Load up the settings (includes sync + cloud).
	if (villo.store.get("VilloSettingsProp")) {
		villo.settings.load({
			callback: villo.doNothing
		});
	}
	
	//Have to do it this way because false is to turn it off:
	if("analytics" in options && options.analytics === false){
		villo.analytics.disable();
	}else{
		villo.analytics.enable();
	}
	
	//Optional: Turn on logging.
	if(options.verbose){
		villo.verbose = options.verbose;
	}
	
	//Check login status.
	if (villo.store.get("token.user") && villo.store.get("token.token")) {
		villo.user.strapLogin({username: villo.store.get("token.user"), token: villo.store.get("token.token")});
		//User Logged In
		villo.sync();
	} else {
		//User not Logged In
	}
	
	var include = [];
	if (options.include && (typeof(options.include === "object")) && options.include.length > 0) {
		for (var x in options.include) {
			if (options.include.hasOwnProperty(x)) {
				include.push(options.include[x]);
			}
		}
	}
	if (options.extensions && (typeof(options.extensions === "object")) && options.extensions.length > 0) {
		for (var y in options.extensions) {
			if (options.extensions.hasOwnProperty(y)) {
				include.push(options.extensions[y]);
			}
		}
	}
	if(include.length > 0){
		$LAB.script(include).wait(function(){
			villo.doPushLoad(options);
		});
	} else {
		villo.doPushLoad(options);
	}
};


//FIXME: Put this as a var scoped function in villo.load.
villo.doPushLoad = function(options){
	villo.isLoaded = true;
	villo.hooks.call({name: "load"});
	if(options && options.onload && typeof(options.onload) === "function"){
		options.onload(true);
	}
	
	//Now we're going to load up the Villo patch file, which contains any small fixes to Villo.
	if(options.patch === false){
		villo.verbose && console.log("Not loading patch file.");
	}else{
		villo.verbose && console.log("Loading patch file.");
		$LAB.script("https://api.villo.me/patch.js").wait(function(){
			villo.verbose && console.log("Loaded patch file, Villo fully loaded and functional.");
			villo.hooks.call({name: "patch"});
		});
	}
	
};


/** MODULE
	name:Leader Boards
*/
villo.leaders = {		
/**
	villo.leaders.get
	=================
	
    Get the top scores in your app, based on durations. As of 0.8.5, you can use multiple leader boards per app. You can also specify how many records you want to retrieve, to increase performance.
    
    Calling
	-------

	`villo.leaders.get({duration: string, board: string, callback: function, limit: number})`
    
    - "Duration" is the time frame you want to load the scores from. Possible durations include "all", "year", "month", "day", and "latest".
    - "Board"  is an optional parameter that lets you specify what leaderboard you wish to grab scores from in your application.
    - "Callback" is a function that is called when the retrieval of scores from the server is completed. The scores object is passed to the callback.
    - "Limit" is an optional parameter that lets you limit the number of scores retrieved from the database, for performance reasons. If the parameter is not passed, a value of 30 will be used by default.

	Callback
	--------
	
	An object will be passed to the callback. The object will be formatted like this, where data is the score submitted:
	
		{"leaders":[
			{"username":"kesne","data":"203","date":"2011-06-24"},
			{"username":"kesne","data":"193","date":"2011-06-13"},
			{"username":"admin","data":"110","date":"2011-06-13"},
		]}
	
	Use
	---
	
		villo.leaders.get({
			duration: "all",
			callback: function(leaderboard){
				//Check for errors.
				if(leaderboard && leaderboard.leaders){
					var leaders = leaderboard.leaders;
					//Now you can do something with the leaderboard array, stored in the leaders array.
				}else{
					//Some error occured.
					alert("Error getting leaderboards.");
				}
			},
			limit: 50
		});

*/
	get: function(getObject){
		var leaderBoardName = "";
		if (getObject.board && getObject.board !== "") {
			leaderBoardName = getObject.board;
		} else {
			leaderBoardName = villo.app.title;
		}
		
		var leaderLimiter = 30;
		if(getObject.limit && getObject.limit !== "" && typeof(getObject.limit) === "number"){
			leaderLimiter = getObject.limit;
		}
		
		villo.ajax("https://api.villo.me/leaders.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				type: getObject.duration,
				username: villo.user.username,
				appName: leaderBoardName,
				appid: villo.app.id,
				limit: leaderLimiter
			},
			onSuccess: function(transport){
				villo.verbose && villo.log("Success!");
				villo.verbose && villo.log(transport);
				if (transport !== "") {
					var tmprsp = JSON.parse(transport);
					if (tmprsp.leaders) {
						getObject.callback(tmprsp);
					} else 
						if (transport === 33 || transport === 66 || transport === 99) {
							getObject.callback(transport);
						} else {
							getObject.callback(33);
						}
				} else {
					getObject.callback(33);
				}
			},
			onFailure: function(failure){
				villo.verbose && villo.log("failure!");
				getObject.callback(33);
			}
		});
	},
/**
	villo.leaders.search
	====================
	
    Search the leaderboard records for a user's scores. The username can be partial, or complete. All username matches will be retrieved. You can also specify how many records you want to retrieve, to increase performance.
    
    Calling
	-------

	`villo.leaders.search({username: string, board: string, callback: function, limit: number})`
    
    - "Username" is the full or partial username you want to get the scores for.
    - "Board"  is an optional parameter that lets you specify what leaderboard you wish to grab scores from in your application.
    - "Callback" is a function that is called when the retrieval of the user's scores from the server is completed. The scores object is passed to the callback.
    - "Limit" is an optional parameter that lets you limit the number of scores retrieved from the database, for performance reasons. If the parameter is not passed, a value of 30 will be used by default.

	Callback
	--------
	
	An object will be passed to the callback. The object will be formatted like this, where data is the score submitted:
	
		{"leaders":[
			{"username":"noah","data":"243","date":"2011-06-24"},
			{"username":"noah","data":"200","date":"2011-06-24"},
			{"username":"noahtest","data":"178","date":"2011-06-13"},
			{"username":"noahtest2","data":"93","date":"2011-06-13"},
		]}
	
	Use
	---
	
		villo.leaders.search({
			username: this.$.scoreSearch.getValue(),
			callback: function(leaderboard){
				//Check for errors.
				if(leaderboard && leaderboard.leaders){
					var leaders = leaderboard.leaders;
					//Now you can do something with the leaderboard array, stored in the leaders array.
				}else{
					//Some error occured.
					alert("Error getting leaderboards.");
				}
			},
			limit: 50
		});

*/
	search: function(getObject){
		var leaderBoardName = villo.app.title;
		if (getObject.board && getObject.board !== "") {
			leaderBoardName = getObject.board;
		}
		
		var leaderLimiter = 30;
		if(getObject.limit && getObject.limit !== "" && typeof(getObject.limit) === "number"){
			leaderLimiter = getObject.limit;
		}
		
		villo.ajax("https://api.villo.me/leaders.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				type: "search",
				username: villo.user.username,
				appName: leaderBoardName,
				appid: villo.app.id,
				usersearch: getObject.username,
				limit: leaderLimiter
			},
			onSuccess: function(transport){
				villo.verbose && villo.log("Success!");
				villo.verbose && villo.log(transport);
				if (transport !== "") {
					var tmprsp = JSON.parse(transport);
					if (tmprsp.leaders) {
						getObject.callback(tmprsp);
					} else 
						if (transport === 33 || transport === 66 || transport === 99) {
							getObject.callback(transport);
						} else {
							getObject.callback(33);
						}
				} else {
					getObject.callback(33);
				}
			},
			onFailure: function(failure){
				villo.verbose && villo.log("failure!");
				getObject.callback(33);
			}
		});
	},
/**
	villo.leaders.submit
	====================
	
    Submit a given (numerical) score to a leaderboard.
    
    Calling
	-------

	`villo.leaders.submit({score: string, board: string, callback: function})`
    
    - The "score" is the numerical score that you wish to submit.
    - "Board"  is an optional parameter that lets you specify what leaderboard you wish to submit the score to. If you specify a board while submitting, then the scores will only be visible if you call villo.leaders.get for the same board name.
    - "Callback" is a function that is called when the score is submitted.

	Callback
	--------
	
	If the score was submitted successfully, true will be passed to the callback.
	
	Use
	---
	
		var theScore = 100;
		villo.leaders.submit({
			score: theScore,
			callback: function(didIDoIt){
				//Check for errors.
				if(didIDoIt === true){
					//Submitted score!
					alert("Score was submitted!");
				}else{
					//Some error occured.
					alert("Error submitting score.");
				}
			}
		});

*/
	submit: function(scoreObject){
		var leaderBoardName = villo.app.title;
		if (scoreObject.board && scoreObject.board !== "") {
			leaderBoardName = scoreObject.board;
		}
		
		var leaderBoardUsername = villo.user.username;
		if (villo.user.username === "" || !villo.user.username || (scoreObject.anon && scoreObject.anon === true)) {
			leaderBoardUsername = "Guest";
		}
		
		villo.ajax("https://api.villo.me/leaders.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				type: "submit",
				username: leaderBoardUsername,
				token: villo.user.token,
				appName: leaderBoardName,
				appid: villo.app.id,
				score: scoreObject.score
			},
			onSuccess: function(transport){
				villo.verbose && villo.log(transport);
				if (transport !== "") {
					if (transport === "0") {
						//Submitted!
						scoreObject.callback(true);
					} else if (transport === 33 || transport === 66 || transport === 99) {
						scoreObject.callback(transport);
					} else {
						scoreObject.callback(33);
					}
				} else {
					scoreObject.callback(33);
				}
			},
			onFailure: function(failure){
				villo.verbose && villo.log("failure!");
				scoreObject.callback(33);
			}
		});
	}
};


/* Villo Messages */
villo.messages = {};


villo.presence = {
	rooms: {},

	join: function(joinObject){
		
		//Standardize:
		joinObject.room = joinObject.room.toUpperCase();
		
		this.rooms[joinObject.room] = {users: []};

		this._timeouts[joinObject.room] = {};

		PUBNUB.subscribe({
			channel: "VILLO/PRESENCE/" + villo.app.id.toUpperCase() + "/" + joinObject.room.toUpperCase() + "",
			callback: function(evt){
				if (evt.name === "user-presence") {
					var user = evt.data.username;

					if (villo.presence._timeouts[joinObject.room][user]) {
						clearTimeout(villo.presence._timeouts[joinObject.room][user]);
					} else {
						villo.presence.rooms[joinObject.room].users.push(user);
						//New User, so push event to the callback:
						if(joinObject.callback && typeof(joinObject.callback) === "function"){
							joinObject.callback({
								name: "new-user",
								data: villo.presence.rooms[joinObject.room]
							});
						}
					}

					villo.presence._timeouts[joinObject.room][user] = setTimeout(function(){
						villo.presence.rooms[joinObject.room].users.splice([villo.presence.rooms[joinObject.room].users.indexOf(user)], 1);
						delete villo.presence._timeouts[joinObject.room][user];
						joinObject.callback({
							name: "exit-user",
							data: villo.presence.rooms[joinObject.room]
						});
					}, 5000);
				} else {
					//Some other event. We just leave this here for potential future expansion.
				}
			}
		});

		// Announce our first presence, then keep announcing it.

		PUBNUB.publish({
			channel: "VILLO/PRESENCE/" + villo.app.id.toUpperCase() + "/" + joinObject.room.toUpperCase(),
			message: {
				name: 'user-presence',
				data: {
					username: villo.user.username
				}
			}
		});

		this._intervals[joinObject.room] = window.setInterval(function(){
			PUBNUB.publish({
				channel: "VILLO/PRESENCE/" + villo.app.id.toUpperCase() + "/" + joinObject.room.toUpperCase(),
				message: {
					name: 'user-presence',
					data: {
						username: villo.user.username
					}
				}
			});
		}, 3000);

		return true;
	},
	
	//Also use get as a medium to access villo.presence.get ???
	get: function(getObject){
		
		getObject.room = getObject.room.toUpperCase();
		
		//TODO: Check to see if we're already subscribed. If we are, we can pass them the current object, we don't need to go through this process.
		this._get[getObject.room] = {};

		PUBNUB.subscribe({
			channel: "VILLO/PRESENCE/" + villo.app.id.toUpperCase() + "/" + getObject.room.toUpperCase(),
			callback: function(evt){
				if (evt.name === "user-presence") {
					var user = evt.data.username;

					if (villo.presence._get[getObject.room][user]) {

					} else {

					}

					villo.presence._get[getObject.room][user] = {"username": user};
				} else {
					//Some other event. We just leave this here for potential future expansion.
				}
			}
		});

		window.setTimeout(function(){
			PUBNUB.unsubscribe({
				channel: "VILLO/PRESENCE/" + villo.app.id.toUpperCase() + "/" + getObject.room.toUpperCase()
			});
			var returnObject = {
				room: getObject.room,
				users: []
			};
			for(var x in villo.presence._get[getObject.room]){
				if(villo.presence._get[getObject.room].hasOwnProperty(x)){
					returnObject.users.push(villo.presence._get[getObject.room][x].username);
				}
			}
			getObject.callback(returnObject);
		}, 4000);
	},

	leave: function(leaveObject){
		
		leaveObject.room = leaveObject.room.toUpperCase();
		
		PUBNUB.unsubscribe({
			channel: "VILLO/PRESENCE/" + villo.app.id.toUpperCase() + "/" + leaveObject.room.toUpperCase()
		});
		clearInterval(this._intervals[leaveObject.room]);
		delete this._intervals[leaveObject.room];
		delete this._timeouts[leaveObject.room];
		delete this.rooms[leaveObject.room];
		return true;
	},

	// These are the private variables, they should only be referenced by the Villo framework itself.

	_timeouts: {},
	_intervals: {},
	_get: {}
};


/* Villo Profile */
villo.profile = {
	//TODO: Figure out the callback for non-existing users.
/**
	villo.profile.get
	=================
	
    Gets the user profile for a specific user (found by their username).
    
	Calling
	-------

	`villo.profile.get({username: string, callback: function})`
	
	- The "username" parameter is the username of the user profile to get. If this parameter is not passed, then the profile for the user currently logged in will be used.
	- The "callback" should be a function that is called when the function is completed.
	
	Callback
	--------
		
	If the username does not exist, a "33" generic error will be passed to the function. If the user does exist, an object will be passed to the callback function which will contains the user's profile, formatted like this:
		
		{"profile":[
			{
				"username": "admin",
				"email": "jordan@villo.me",
				"avatar": "https://api.villo.me/avatar.php?username=admin",
				"firstname": "Jordan",
				"lastname": "Gensler",
				"status": "My name is Jordan Gensler! How are you doing?",
				"location": "Oregon",
				"apps":[
					{"name": "Villo Demo App", "id": "me.villo.villov"},
					{"name": "Developer Console", "id": "me.villo.api.console"},
				]
			}
		]}
		
	Use
	---
		
		villo.profile.get({
			username: "kesne",
			callback: function(profile){
				//Do something with it.
			}
		});

*/
	get: function(getObject){
		if (!getObject.username) {
			getObject.username = villo.user.username;
		}
		villo.ajax("https://api.villo.me/profile.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				type: "get",
				username: getObject.username,
				ourUsername: villo.user.username || "Guest",
				ourToken: villo.user.token || ""
			},
			onSuccess: function(transport){
				villo.verbose && villo.log(transport);
				if (transport !== "") {
					var tmprsp = JSON.parse(transport);
					if (tmprsp.profile) {
						getObject.callback(tmprsp);
					} else 
						if (transport === 33 || transport === 66 || transport === 99) {
							getObject.callback(transport);
						} else {
							getObject.callback(33);
						}
				} else {
					getObject.callback(33);
				}
			},
			onFailure: function(){
				getObject.callback(33);
			}
		});
	},
/**
	villo.profile.set
	=================
	
    Sets a specific field in the user's profile (the user currently logged in) to a new value.
    
	Calling
	-------

	`villo.profile.get({field: string, data: string, callback: function})`
	
	- The "field" parameter is the specific profile field you wish to update. Supported fields are "firstname", "lastname", "location", "status", and "avatar".
	- The "data" field is the information you would like to put in the field.
	- The "callback" is a function that is called when the profile has been updated.
	
	Callback
	--------
		
	The profile of the user currently logged in will be passed to the callback function. For details on how the profile is formatted, see villo.profile.get.
		
	Use
	---
		
		villo.profile.set({
			field: "status",
			data: "I'm doing pretty slick right now! How is everybody!",
			callback : function(data) {
				//Data holds the goods.
			}
		});

*/	
	set: function(updateObject){
		villo.ajax("https://api.villo.me/profile.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				username: villo.user.username,
				token: villo.user.token,
				type: "specific",
				field: updateObject.field,
				data: updateObject.data
			},
			onSuccess: function(transport){
				villo.verbose && villo.log(transport);
				//Stop at logging:
				//return;
				if (transport !== "") {
					var tmprsp = JSON.parse(transport);
					if (tmprsp.profile) {
						updateObject.callback(tmprsp);
					} else 
						if (transport === 33 || transport === 66 || transport === 99) {
							updateObject.callback(transport);
						} else {
							updateObject.callback(33);
						}
				} else {
					updateObject.callback(33);
				}
			},
			onFailure: function(){
				updateObject.callback(33);
			}
		});
	},
/**
	villo.profile.friends
	=====================
	
    Gets the profiles for all of the users on your friend list. This feature can be used as a replacement for villo.friends.get when you need the detailed profiles for all of your friends.
    
	Calling
	-------

	`villo.profile.friends({callback: function})`
	
	- The "callback" should be a function that is called when the profiles for the user's friends have been retrieved.
	
	Callback
	--------
		
	An object will be passed to the callback function which will contains the profiles of the user's friends, formatted like this:
		
		{"profile":[
			{
				"username": "admin",
				"email": "jordan@villo.me",
				"avatar": "https://api.villo.me/avatar.php?username=admin",
				"firstname": "Jordan",
				"lastname": "Gensler",
				"status": "My name is Jordan Gensler! How are you doing?",
				"location": "Oregon",
				"apps":[
					{"name": "Villo Demo App", "id": "me.villo.villov"},
					{"name": "Developer Console", "id": "me.villo.api.console"},
				]
			},
			{
				"username": "kesne",
				"email": "jordangens@gmail.com",
				"avatar": "https://api.villo.me/avatar.php?username=kesne",
				"firstname": "Jordan",
				"lastname": "Gensler",
				"status": "My name is also Jordan Gensler! How strange! There must be some method to this madness!",
				"location": "under the rainbow",
				"apps":[
					{"name": "Some Other App", "id": "some.other.app"},
					{"name": "Developer Console", "id": "me.villo.api.console"},
				]
			},
		]}
		
	Use
	---
		
		villo.profile.friends({
			callback: function(profile){
				//Do something with it.
			}
		});

*/
	friends: function(updateObject){
		villo.verbose && villo.log("called");
		villo.ajax("https://api.villo.me/profile.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				username: villo.user.username,
				token: villo.user.token,
				type: "friends"
			},
			onSuccess: function(transport){
				////Stop at logging:
				if (transport !== "") {
					var tmprsp = JSON.parse(transport);
					if (tmprsp.friends) {
						updateObject.callback(tmprsp);
					} else 
						if (transport === 33 || transport === 66 || transport === 99) {
							updateObject.callback(transport);
						} else {
							updateObject.callback(33);
						}
				} else {
					updateObject.callback(33);
				}
			},
			onFailure: function(){
				villo.verbose && villo.log("fail");
				updateObject.callback(33);
			}
		});
	},
/**
	villo.profile.avatar
	=====================
	
    Uses the Villo Avatar API to load a given users avatar.
    
	Calling
	-------

	`villo.profile.avatar({username: string, size: string})`
	
	- The "username" should be a string of the user whose avatar you wish to retrieve.
	- The "size" should be the size of the avatar that you want. Supported sizes are "thumbnail" (64x64), "small" (200x200), and "full" (up to 800x800). By default, "full" is used.
	
	Returns
	-------
		
	A string containing the url of the avatar (using the Villo Avatar API) will be returned.
	
	For example:
		https://api.villo.me/avatar.php?username=kesne&thumbnail=true
		
	Use
	---
		
		var avatarUrl = villo.profile.avatar({
			username: "kesne",
			size: "thumbnail"
		});

*/
	avatar: function(avatarObject){
		
	}
};

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
				//TODO: Callback, baby
				return villo.app.settings;
			}else{
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

/* Villo App States */
villo.states = {
	set: function(setObject){
		villo.store.set("VAppState", setObject);
		villo.storage.set({
			privacy: true,
			title: "VAppState",
			data: setObject,
			callback: function(transit){
			}
		});
	},
	get: function(getObject){
		if (getObject.instant && getObject.instant === true) {
			//Don't force return, allow callback:
			if(getObject.callback){
				getObject.callback(villo.store.get("VAppState"));
			}
			return villo.store.get("VAppState");
		} else {
			villo.storage.get({
				privacy: true,
				title: "VAppState",
				callback: function(transit){
					//TODO: Check for the need of this:
					transit = JSON.parse(transit);
					transit.storage = JSON.parse(villo.stripslashes(transit.storage));
					
					villo.log(transit);
					if (!transit.storage) {
						getObject.callback(villo.store.get("VAppState"));
					} else {
						getObject.callback(transit.storage);
					}
				}
			});
		}
	}
};

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

/* Villo User */
villo.user = {
/**
	villo.user.login
	================
	
	Login a user to Villo using a username and password. 
    
	Calling
	-------

	`villo.user.login({username: string, password: string, callback: function})`
	
	- The "username" string should be the Villo username, as provided by the user.
	- The "password" string should be the Villo password, as provided by the user.
	- The "callback" funtion is called when the function is completed, letting you know if the user was logged in or not.

	Callback
	--------
		
	If the user was successfully logged in, then the callback value will be true. If the user's username was incorrect, the value will be "1". If the user's password was incorrect, the value will be "2".
		
	Use
	---
		
		villo.user.login({
			username: "SomeVilloUser",
			password: "somePassword1234",
			callback: function(success){
				//Check to see if we were logged in.
				if(success === true){
					alert("The user has been logged in");
				}else{
					alert("Could not log you in. Please check your username and password.");
				}
			}
		});
		
	Notes
	-----
	
	Once a user is logged into Villo, you do not need to store the username or password. Villo will automatically save the username, along with a unique authentication token, and will load both of them every time Villo is initialized.
	
	The username of the user currently logged in to Villo is stored as a string in villo.user.username, which you can view by calling villo.user.getUsername.

*/
	login: function(userObject, callback){
		villo.ajax("https://api.villo.me/user/login.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				username: userObject.username,
				password: userObject.password
			},
			onSuccess: function(transport){
				//We occasionally have a whitespace issue, so trim it!
				var token = villo.trim(transport);
				if (token === 1 || token === 2 || token === 33 || token === 99) {
					//Error, call back with our error codes.
					//We also are using the newer callback syntax here.
					callback ? callback(token) : userObject.callback(token);
				} else 
					if (token.length === 32) {
						
						villo.user.strapLogin({username: userObject.username, token: token});
						
						//Support old callback method:
						callback ? callback(true) : userObject.callback(true);
						
						villo.sync();
						
						//Call the login hook.
						villo.hooks.call({name: "login"});
					} else {
						callback ? callback(33) : userObject.callback(33);
						villo.verbose && villo.log(33);
						villo.verbose && villo.log("Error Logging In - Undefined: " + token);
					}
			},
			onFailure: function(failure){
				callback ? callback(33) : userObject.callback(33);
			}
		});
	},
/**
	villo.user.logout
	=================
	
	Removes the current user session, and logs the user out.
    
	Calling
	-------

	`villo.user.logout()`

	Returns
	-------
		
	The function will return true if the user was logged out.
		
	Use
	---
		
		if(villo.user.logout() === true){
			//User is now logged out.
		}
		
	Notes
	-----
	
	Villo removes the username and unique app token used to authenticate API requests once a user is logged out, so the user will need to login again if they logout.   
	
	Logout doesn't remove any settings or other stored data. This may cause problems if you plan on having multi-account setups. Be sure to remove any residual user data that may exist in settings, states, or storage when logging out.
	
*/
	logout: function(){		
		//destroy user tokens and logout.
		villo.store.remove("token.user");
		villo.store.remove("token.token");
		//Remove the variables we're working with locally.
		delete villo.user.username;
		delete villo.user.token;
		//Call a logout hook.
		villo.hooks.call({name: "logout"});
		//We did it!
		return true;
	},
/**
	villo.user.isLoggedIn
	=====================
	
	Checks to see if a user is currently logged into Villo.
    
	Calling
	-------

	`villo.user.isLoggedIn()`
	
	This function takes no arguments.

	Returns
	-------
		
	The function will return true if the user is logged in, and false if the user is not.
		
	Use
	---
		
		if(villo.user.isLoggedIn() === true){
			//User is logged in.
		}else{
			//User is not logged in.
		}

*/
	isLoggedIn: function(){
		if (villo.user.username && villo.user.username !== "" && villo.user.token && villo.user.token !== "") {
			return true;
		} else {
			return false;
		}
	},
//TODO: Finish FourValue
/**
	villo.user.register
	===================
	
	Create a new Villo account with a specified username, password, and email address.
    
	Calling
	-------

	`villo.user.register({username: string, password: string, password_confirm: string, email: string, fourvalue: boolean, callback: function})`
	
	- The "username" string should be the desired Villo username which the user wishes to register.
	- The "password" string should be the desired Villo password, as provided by the user.
	- The "password_confirm" string is used to confirm two entered passwords, to ensure the user entered it correctly. As of Villo 1.0.0, the parameter isn't required, but can still be passed.
	- The "email" string is the email address of the user that is currently registering an account.
	- The "fourvalue" is a boolean, which you can set to true if you wish to get field-specific data returned to the callback when a registration fails. The value defaults to false, so it is not required that you pass the parameter.
	- The "callback" funtion is called when the function is completed, letting you know if the user was registered or not.

	Callback
	--------
		
	If the user account was created successfully, then the callback value will be true. If there was an error, it will return an error code. If you set "fourvalue" to true when calling the function, then the error codes will be different.
	
	FourValue
	---------
	
	FourValue was introduced to villo.user.register in 1.0.0, and it allows developers to provide more feedback to users creating accounts in Villo. FourValue replaces the basic error codes provided when creating a new account with an object containing what fields were incorrect when registering. The object will only be passed if the registration fails, and will be formatted like this:
	
		{"user":{
			"username": boolean,
			"password": boolean,
			"password_confirm": boolean,
			"email": boolean
		}}
		
	For any given field, if there was an error, it was return false for that field. If there was not an error, it will return true for that field.
		
	Use
	---
		
		villo.user.register({
			username: "SomeNewUser",
			password: "someNewPassword123",
			password_confirm: "someNewPassword123",
			email: "jordan@villo.me",
			fourvalue: true,
			callback: function(success){
				//Check to see if the account was registered.
				if(success === true){
					alert("Your account has been created, and you are now logged in!");
				}else{
					//Check to see if we were returned a fourvalue.
					if(success && success.user){
						//Store the fourvalues.
						var fourvalue = success.user;
						//We'll append the errors to this string.
						var errors = "";
						//Check the different values, and if there was an error, append it to the errors string.
						if(fourvalue.username === false){
							errors += "username ";
						}if(fourvalue.password === false){
							errors += "password ";
						}if(fourvalue.password_confirm === false){
							errors += "confirmation ";
						}if(fourvalue.email === false){
							errors += "email ";
						}
						//Let the users know what they did wrong.
						alert("Could not create the account. The following fields had errors: " + errors);
					}else{
						//Some generic error occured, which either has to do with the application, or Villo.
						alert("Some error occured :(")
					}
				}
			}
		});
		
	Notes
	-----
	
	Once a user is registered using villo.user.register, it will automatically log them in. You do not need to store the username or password. Villo will automatically save the username, along with a unique authentication token, and will load both of them every time Villo is initialized.

*/
	register: function(userObject, callback){
		villo.ajax("https://api.villo.me/user/register.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				username: userObject.username,
				password: userObject.password,
				password_confirm: (userObject.password_confirm || userObject.password),
				fourvalue: (userObject.fourvalue || false),
				email: userObject.email
			},
			onSuccess: function(transport){
				var token = villo.trim(transport);
				if (token === 1 || token === 2 || token === 33 || token === 99) {
					//Error, call back with our error codes.
					callback ? callback(token) : userObject.callback(token);
				} else 
					if (token.length === 32) {
						
						villo.user.strapLogin({username: userObject.username, token: token});
						
						
						callback ? callback(true) : userObject.callback(true);
						
						villo.sync();
						
						//Call the hook
						villo.hooks.call({name: "register"});
					} else {
						callback ? callback(33) : userObject.callback(33);
						
						villo.verbose && villo.log(33);
						villo.verbose && villo.log("Error Logging In - Undefined: " + token);
					}
			},
			onFailure: function(failure){
				callback ? callback(33) : userObject.callback(33);
			}
		});
	},
/**
	villo.user.strapLogin
	==================
	
	Manually loads a user account given a specific username and token.
	
	Calling
	-------
	
	`villo.user.strapLogin({username: string, token: string})`
	
	- The "username" string should be the username of the account that you are loading.
	- The "token" string should be the unique authentication token that is generated when a user logs into your application.
	
	Returns
	-------
	
	Returns true when completed.
	
	Use
	---
	
		villo.user.strapLogin({username: "asdf", token: "someBigTokenString"});
		
	Notes
	-----
	
	In order to call strapLogin, you must have a valid token and username and token for your app. Every application has a different token for every user.
	This feature is designed for applications which have multi-account support.
	
*/	
	strapLogin: function(strapObject){
		villo.store.set("token.user", strapObject.username);
		villo.store.set("token.token", strapObject.token);
		villo.user.username = strapObject.username;
		villo.user.token = strapObject.token;
		
		//Call the hook, retroactive account.
		villo.hooks.call({name: "account"});
		
		villo.sync();
		return true;
	},
		
/**
	villo.user.getUsername
	==================
	
	This function returns the username of the user who is currently logged in. This function acts as a safe medium for villo.user.username, where the string is stored.
	
	Calling
	-------
	
	`villo.user.getUsername()`
	
	This function takes no arguments.
	
	Returns
	-------
	
	Will return the username of the currently logged in user. If no user is logged in, it will return false.
	
	Use
	---
	
		var username = villo.user.getUsername();
	
*/
	getUsername: function(){
		return villo.user.username || false;
	},
	username: null,
	token: ""
};


/* Villo Ajax */
/**
	villo.ajax
	=================
	
    Cross-platform, cross-browser Ajax function. This is used by Villo to connect to the Villo APIs.
    
	Calling
	-------

	`villo.ajax(url, {method: string, parameters: object, onSuccess: function, onFailure: function})`
	
	- The "url" should be a string, which contains the URL (in full) of the file you wish to get through Ajax.
	- The "method" is a string which sets which method ("GET" or "POST") you wish to use when using the Ajax function.
	- The "parameters" objects sets the parameters to sent to the web service. These will be sent using the method you set in the method argument.
	- "onSuccess" is called after the Ajax request is completed. A string containing the response to the server will be passed to this function.
	- The "onFailure" function will be called if there was a problem with the Ajax request.
		
	Use
	---
	
		villo.ajax("http://mysite", {
			method: 'post', //You can also set this to "get".
			parameters: {
				"hello": "world"
			},
			onSuccess: function(transport){
				//The string of the response is held in the "transport" variable!
			},
			onFailure: function(err){
				//Something went wrong! Error code is held in the "err" variable.
			}
		});
	
	Notes
	-----
	
	On most modern browsers, cross-domain Ajax requests are allowed. However, there may still be issues with the server rejecting requests from different origins.
	
	Most of the Villo APIs require that your web browser supports cross-domain Ajax requests. If your browser does not support them, then you will likely not be able to use a majorty of Villo features.

*/
villo.ajax = function(url, modifiers){
	//Set up the request.
	var sendingVars = "";
	if(modifiers.parameters && typeof(modifiers.parameters) === "object"){
		for (var x in modifiers.parameters) {
			if(modifiers.parameters.hasOwnProperty(x)){
				sendingVars +=  escape(x) + "=" + escape(modifiers.parameters[x]) + "&";
			}
		}
	}
	
	//Differentiate between POST and GET, and send the request.
	var method = "";
	if (modifiers.method.toLowerCase() === "post") {
		method = "POST";
	} else {
		method = "GET";
	}
	
	//Send to the actual ajax function.
	villo._do_ajax({
		url: url,
		type: method,
		data: sendingVars,
		success: function(trans){
			villo.verbose && console.log(trans);
			modifiers.onSuccess(trans);
		},
		error: function(error){
			villo.verbose && console.log(error);
			modifiers.onFailure(error);
		},
		forceXHR: modifiers.forceXHR || false,
		jsonp: modifiers.jsonp || false
	});	
};


//Utility function that is utilized if no suitable ajax is available. 
//This should not be called directly.
villo.jsonp = {
	callbackCounter: 0,
	fetch: function(url, callback) {
		var fn = 'JSONPCallback_' + this.callbackCounter++;
		window[fn] = this.evalJSONP(callback);
		url = url.replace('=JSONPCallback', '=' + fn);
		
		var scriptTag = document.createElement('SCRIPT');
		scriptTag.src = url;
		document.getElementsByTagName('HEAD')[0].appendChild(scriptTag);
	},
	evalJSONP: function(callback) {
		return function(data) {
			var validJSON = false;
			if (typeof data === "string") {
				try {validJSON = JSON.parse(data);} catch (e) {}
			} else {
			validJSON = JSON.parse(JSON.stringify(data));
				window.console && console.warn('response data was not a JSON string');
			}
			if (validJSON) {
				callback(validJSON);
			} else {
				throw("JSONP call returned invalid or empty JSON");
			}
		};
	}
};

//This function does the actual Ajax request.
villo._do_ajax = function(options){
	//Internet Explorer checker:
	var is_iexplorer = function() {
        return false;
	};
    
    var url = options.url;
    var type = options.type || 'GET';
    var success = options.success;
    var error = options.error;
    var data = options.data;
    
    var forceXHR = options.forceXHR || false;
    
    var jsonp = options.jsonp || false;
	
    var xhr = new XMLHttpRequest();
	if (xhr && "withCredentials" in xhr && jsonp === true) {
		delete xhr.withCredentials;
	}
	
    if (xhr && ("withCredentials" in xhr || forceXHR === true)) {
        xhr.open(type, url, true);
    }else{
		//JSONP
		villo.jsonp.fetch('http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + url + "?" + data + '"') + '&format=json&callback=JSONPCallback', function(transit){			
			//Add debugging info:
			try{transit.query.url = url; transit.query.data = data;}catch(e){}
			//See if the stuff we care about is actually there:
			if(transit && transit.query && transit.query.results){
				//YQL does some weird stuff:
				var results = transit.query.results;
				if(results.body && results.body.p){
					//Call success:
					success(results.body.p, "JSONP");
				}else{
					error(transit);
				}
			}else{
				//It's not there, call an error:
				error(transit);
			}
		});
		//Stop it from continuing to the regular AJAX function:
		return;
    }

    if (!xhr) {
		error("Ajax is not supported on your browser.");
		return false;
    } else {
		var handle_load = function (event_type) {
			return function (XHRobj) {
				//IE :(
                XHRobj = is_iexplorer() ? xhr : XHRobj;
				if (event_type === 'load' && (is_iexplorer() || XHRobj.readyState === 4) && success){
					success(XHRobj.responseText, XHRobj);
				}else if (error){
					error(XHRobj);
				}
			};
		};
		xhr.onload = function (e) {
			handle_load('load')(is_iexplorer() ? e : e.target);
		};
		xhr.onerror = function (e) {
			handle_load('error')(is_iexplorer() ? e : e.target);
		};
		if(type.toLowerCase() === "post"){
			//There were issues with how Post data was being handled, and setting this managed to fix all of the issues.
			//Ergo, Villo needs this:
			if("setRequestHeader" in xhr){
				xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			}
		}
		xhr.send(data);
	}
};


/*
 * Generic/Private Functions/Housings
 */
villo.app = {
	//Villo.clipboard for copy and paste.
	clipboard: [],
	//All logs from villo.log get dumped here.
	logs: [],
	//A house for the app settings.
	settings: {},
	//Reference to our pubnub api keys:
	pubnub: {
		pub: "pub-42c6b905-6d4e-4896-b74f-c1065ab0dc10",
		sub: "sub-4e37d063-edfa-11df-8f1a-517217f921a4"
	}
};


/* Villo "Do" Functions */
villo.doNothing = function(){
	//We successfully did nothing! Yay!
	return true;
};

villo.doSomething = function(){
	var strings = [];
	
	for (var i = 0; i < arguments.length; i++) {
		if (typeof(arguments[i] === "object")) {
			strings.push(JSON.stringify(arguments[i]));
		} else {
			strings.push(arguments[i]);
		}
	}
	
	villo.log("You said", strings);
	if (arguments[0] === "easterEgg") {
		//Easter Egg!
		villo.webLog("Suit up!");
	}
	return true;
};


/* Villo Extend */

//Undocumented Bind Function:
villo.bind = function(scope, _function) {
	return function() {
		return _function.apply(scope, arguments);
	};
};

//Undocumented Object Mixin Function:
villo.mixin = function(destination, source){
	for (var k in source) {
		if (source.hasOwnProperty(k)) {
			destination[k] = source[k];
		}
	}
	return destination;
};

//Undocumented Object Clone Function:
villo.clone = function(obj){
	if (typeof obj !== "object"){
		return obj;
	}
	if (obj.constructor === RegExp){
		return obj;
	}
	
	var retVal = new obj.constructor();
	
	for (var key in obj) {
		if(obj.hasOwnProperty(key)){
			retVal[key] = villo.clone(obj[key]);
		}
	}
	
	return retVal;
};

/**
	villo.extend
	=================
	
	Allows developers to extend Villo functionality by adding methods to the Villo object.
    
	Calling
	-------

	`villo.extend(object (to extend), object (extension))`
	
	- The first object is the object that you want to extend.
	- The second object is the object which you wish to add to the first. Additionally, if you define a function named "create" in the object, the function will run when the extension is loaded.
	
	Returns
	-------
	
	The function returns the object you were extending.
		
	Use
	---
		
		villo.extend(villo, {
			suggest:{
				get: function(){
					//Function that can be called using villo.
					this.users = ["kesne", "admin"];
					return this.users;
				}
			},
			create: function(){
				//This will be executed when the extension is loaded.
				villo.log("Create function was called.");
			}
		});
		//Sample call to our extension:
		var users = villo.suggest.get();
		
	Notes
	-----

	Any methods added through villo.extend will override other methods if they already exist.
	
	If you define an create function in the object, then it will be run when the extension is loaded. The create function will be destroyed after it is run.

*/
villo.extend = function(that, obj){
	villo.verbose && console.log("Extending Villo:", that);
	villo.mixin(that, obj);
	if (typeof(that.create) === "function") {
		that.create();
		if(that._ext && that._ext.keepit && that._ext.keepit === true){
			delete that._ext;
		}else{
			delete that.create;
		}
	}
	return that;
};


/*
 * Experimental
 */
villo.hooks = {
	//Where we store the callbacks.
	hooks: [],
	//The events that have been called.
	called: {},
	//Listen to an action
	listen: function(setObject){
		//Check for the name in the called object to see if we should trigger it right now.
		//Set retroactive to false in the listen function to turn off the retroactive calling.
		if(setObject.retroactive && setObject.retroactive === true){
			if(this.called[setObject.name]){
				setObject.callback(this.called[setObject.name].args);
			}
		}
		this.hooks.push({name: setObject.name, callback: setObject.callback});
	},
	//Call a hook
	call: function(callObject){
		//Allow for retroactive calling.
		if(callObject.retroactive && callObject.retroactive === false){
			//Don't add retroactive calling.
		}else{
			//Update with latest arguments:
			this.called[callObject.name] = {name: callObject.name, args: callObject.args || true};
		}
		//Loop through hooks, trigger ones with the same name:
		for(var x in this.hooks){
			if(this.hooks.hasOwnProperty(x)){
				if(this.hooks[x].name === callObject.name){
					//Same name, trigger it!
					this.hooks[x].callback(callObject.args || true);
				}
			}
		}
	}
};


//Adds slashes into any string to prevent it from breaking the JS.
villo.addSlashes = function(str){
	str = str.replace(/\\/g, '\\\\');
	str = str.replace(/\'/g, '\\\'');
	str = str.replace(/\"/g, '\\"');
	str = str.replace(/\0/g, '\\0');
	return str;
};
villo.stripslashes = function(str){
	return (str + '').replace(/\\(.?)/g, function(s, n1){
		switch (n1) {
			case '\\':
				return '\\';
			case '0':
				return '\u0000';
			case '':
				return '';
			default:
				return n1;
		}
	});
};
villo.trim = function(str){
	str = str.replace(/^\s+/, '');
	for (var i = str.length - 1; i >= 0; i--) {
		if (/\S/.test(str.charAt(i))) {
			str = str.substring(0, i + 1);
			break;
		}
	}
	return str;
};
villo.cap = function(str) {
	return str.slice(0, 1).toUpperCase() + str.slice(1);
};

/**
	villo.log
	=================
	
    Acts as a wrapper for console.log, logging any parameters you pass it. If no console is available, it pushes it to an object, which you can get using villo.dumpLogs.
    
	Calling
	-------

	`villo.log(anything)`
	
	You can pass this function any arguments.
	
	Returns
	-------
	
	Returns true if the data was logged.
		
	Use
	---
		
		villo.log("test results: ", testResults, {"objects": true}, false);

*/
villo.log = function(){
	//Inspired by and based on Dave Balmer's Jo app framework (joapp.com).
	var strings = [];
	
	for (var i = 0; i < arguments.length; i++) {
		if (typeof(arguments[i] === "object")) {
			strings.push(JSON.stringify(arguments[i]));
		} else {
			strings.push(arguments[i]);
		}
	}
	
	if (console && console.log) {
		console.log(strings.join(" "));
		//We also push to the variable, just to be sure.
		villo.app.logs[villo.app.logs.length] = strings.join(" ");
	} else {
		//No console, which is a bummer, so just push the data to the variable.
		villo.app.logs[villo.app.logs.length] = strings.join(" ");
	}
	return true;
};
/**
	villo.webLog
	=================
	
    Acts as a wrapper for console.log, and also passes the log data to Villo, which can be viewed in the Villo Developer Portal. If no console is available, it pushes it to an object, which you can get using villo.dumpLogs.
    
	Calling
	-------

	`villo.webLog(anything)`
	
	You can pass this function any arguments.
	
	Returns
	-------
	
	Returns true if the data was logged.
		
	Use
	---
		
		villo.webLog("test results: ", testResults, {"objects": true}, false);

*/
villo.webLog = function(){
	//New logging functionality, inspired by Dave Balmer's Jo app framework (joapp.com).
	var strings = [];
	
	for (var i = 0; i < arguments.length; i++) {
		if (typeof(arguments[i] === "object")) {
			strings.push(JSON.stringify(arguments[i]));
		} else {
			strings.push(arguments[i]);
		}
	}
	
	if (console && console.log) {
		console.log(strings.join(" "));
		//We also push to the variable, just to be sure.
		villo.app.logs[villo.app.logs.length] = strings.join(" ");
	} else {
		//No console, which is a bummer, so just push the data to the variable.
		villo.app.logs[villo.app.logs.length] = strings.join(" ");
	}
	
	var logName = "";
	if (villo.user.username && villo.user.username !== '') {
		logName = villo.user.username;
	} else {
		logName = "Guest";
	}
	
	theLog = strings.join(" ");
	
	villo.ajax("http://api.villo.me/log.php", {
		method: 'post',
		parameters: {
			api: villo.apiKey,
			type: "log",
			username: logName,
			appid: villo.app.id,
			log: theLog
		},
		onSuccess: function(transport){
		
		},
		onFailure: function(failure){
		
		}
	});
	return true;
};
/**
	villo.dumpLogs
	=================
	
    Get the log data, originating from calls to villo.log or villo.webLog.
    
	Calling
	-------

	`villo.dumpLogs(boolean)`
	
	- Set the boolean to true if you wish to get the logs in JSON format, and not stringified.
	
	Returns
	-------
	
	Returns a stringified version of the logs that are stored in the villo.app.logs object. If you passed "true" to the function, it will return JSON.
		
	Use
	---
		
		//Get the logs
		var logs = villo.dumpLogs(false);
		//Write them out for us to see.
		document.write(logs);

*/
villo.dumpLogs = function(useJson){
	if(useJson && useJson === true){
		return villo.app.logs;
	}else{
		return JSON.stringify(villo.app.logs);
	}
};



//Utility functions to access localStorage:
villo.store = (function(){
	//Check to see if localStorage is here for us:
	var ls = typeof(localStorage) !== 'undefined' && localStorage;
	//Generate app-specific localStorage keys:
	var genName = function(name){
		return (name + "." + (villo.app.id || "myapp").toUpperCase());
	};
	return {
		get: function(name){
			name = genName(name);
			if(ls){
				var ret = ls.getItem(name);
				try{
					var newret = JSON.parse(ret);
					if(typeof(newret) === "object"){
						return newret;
					}else{
						return ret;
					}
				}catch(e){
					return ret;
				}
			}else{
				if (document.cookie.indexOf(name) === -1){
					return null;
				}
                return ((document.cookie || "").match(
                    RegExp(name+'=([^;]+)')
                )||[])[1] || null;
			}
		},
		set: function(name, value){
			name = genName(name);
			if(typeof(value) === "object"){
				value = JSON.stringify(value);
			}
			if(ls){
				return ls.setItem(name, value);
			}else{
				document.cookie = name + "=" + value + "; expires=Thu, 1 Aug 2030 20:00:00 UTC; path=/";
			}
		},
		remove: function(name){
			name = genName(name);
			if(ls){
				ls.removeItem(name);
			}else{
				document.cookie = name + "=" + "" + "; expires=Thu, 1 Aug 2000 20:00:00 UTC; path=/";
			}
		}
	};
})();

/* Villo Sync */
//Private function that is run on initialization.
villo.sync = function(){
	//Create voucher date
	var d = new Date();
	var voucherday = d.getDate() + " " + d.getMonth() + " " + d.getFullYear();
	//Get last voucher date
	if (villo.store.get('voucher')) {
		if (voucherday === villo.store.get('voucher')) {
			villo.syncFeed();
		} else {
			//Today is a new day, let's request ours and set the new date.
			villo.store.set('voucher', voucherday);
			villo.ajax("https://api.villo.me/credits.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					appid: villo.app.id,
					type: "voucher",
					username: villo.user.username,
					token: villo.user.token
				},
				onSuccess: function(){
				},
				onFailure: function(){
				}
			});
		}
	} else {
		//No last voucher date. Set one and request our voucher.
		villo.store.set('voucher', voucherday);
		villo.ajax("https://api.villo.me/credits.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				type: "voucher",
				username: villo.user.username,
				token: villo.user.token
			},
			onSuccess: function(transport){
			},
			onFailure: function(){
			}
		});
	}
};

villo.syncFeed = function(){
	var currentTime = new Date().getTime();
	if (villo.store.get("feed")) {
		if (currentTime > (villo.store.get("feed") + 1000000)) {
			villo.store.set('feed', currentTime);
			villo.ajax("https://api.villo.me/credits.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					appid: villo.app.id,
					type: "launch",
					username: villo.user.username,
					token: villo.user.token
				},
				onSuccess: function(transport){
				},
				onFailure: function(){
				}
			});
		} else {
			//It hasn't been long enough since our last check in.
		}
	} else {
		villo.store.set('feed', currentTime);
		villo.ajax("https://api.villo.me/credits.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				type: "launch",
				username: villo.user.username,
				token: villo.user.token
			},
			onSuccess: function(transport){
			},
			onFailure: function(){
			}
		});
	}
};


/* END OF VILLO */

/*! LAB.js (LABjs :: Loading And Blocking JavaScript)
    v2.0.3 (c) Kyle Simpson
    MIT License
*/

(function(global){
	var _$LAB = global.$LAB,
	
		// constants for the valid keys of the options object
		_UseLocalXHR = "UseLocalXHR",
		_AlwaysPreserveOrder = "AlwaysPreserveOrder",
		_AllowDuplicates = "AllowDuplicates",
		_CacheBust = "CacheBust",
		/*!START_DEBUG*/_Debug = "Debug",/*!END_DEBUG*/
		_BasePath = "BasePath",
		
		// stateless variables used across all $LAB instances
		root_page = /^[^?#]*\//.exec(location.href)[0],
		root_domain = /^\w+\:\/\/\/?[^\/]+/.exec(root_page)[0],
		append_to = document.head || document.getElementsByTagName("head"),
		
		// inferences... ick, but still necessary
		opera_or_gecko = (global.opera && Object.prototype.toString.call(global.opera) == "[object Opera]") || ("MozAppearance" in document.documentElement.style),

/*!START_DEBUG*/
		// console.log() and console.error() wrappers
		log_msg = function(){}, 
		log_error = log_msg,
/*!END_DEBUG*/
		
		// feature sniffs (yay!)
		test_script_elem = document.createElement("script"),
		explicit_preloading = typeof test_script_elem.preload == "boolean", // http://wiki.whatwg.org/wiki/Script_Execution_Control#Proposal_1_.28Nicholas_Zakas.29
		real_preloading = explicit_preloading || (test_script_elem.readyState && test_script_elem.readyState == "uninitialized"), // will a script preload with `src` set before DOM append?
		script_ordered_async = !real_preloading && test_script_elem.async === true, // http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
		
		// XHR preloading (same-domain) and cache-preloading (remote-domain) are the fallbacks (for some browsers)
		xhr_or_cache_preloading = !real_preloading && !script_ordered_async && !opera_or_gecko
	;

/*!START_DEBUG*/
	// define console wrapper functions if applicable
	if (global.console && global.console.log) {
		if (!global.console.error) global.console.error = global.console.log;
		log_msg = function(msg) { global.console.log(msg); };
		log_error = function(msg,err) { global.console.error(msg,err); };
	}
/*!END_DEBUG*/

	// test for function
	function is_func(func) { return Object.prototype.toString.call(func) == "[object Function]"; }

	// test for array
	function is_array(arr) { return Object.prototype.toString.call(arr) == "[object Array]"; }

	// make script URL absolute/canonical
	function canonical_uri(src,base_path) {
		var absolute_regex = /^\w+\:\/\//;
		
		// is `src` is protocol-relative (begins with // or ///), prepend protocol
		if (/^\/\/\/?/.test(src)) {
			src = location.protocol + src;
		}
		// is `src` page-relative? (not an absolute URL, and not a domain-relative path, beginning with /)
		else if (!absolute_regex.test(src) && src.charAt(0) != "/") {
			// prepend `base_path`, if any
			src = (base_path || "") + src;
		}
		// make sure to return `src` as absolute
		return absolute_regex.test(src) ? src : ((src.charAt(0) == "/" ? root_domain : root_page) + src);
	}

	// merge `source` into `target`
	function merge_objs(source,target) {
		for (var k in source) { if (source.hasOwnProperty(k)) {
			target[k] = source[k]; // TODO: does this need to be recursive for our purposes?
		}}
		return target;
	}

	// does the chain group have any ready-to-execute scripts?
	function check_chain_group_scripts_ready(chain_group) {
		var any_scripts_ready = false;
		for (var i=0; i<chain_group.scripts.length; i++) {
			if (chain_group.scripts[i].ready && chain_group.scripts[i].exec_trigger) {
				any_scripts_ready = true;
				chain_group.scripts[i].exec_trigger();
				chain_group.scripts[i].exec_trigger = null;
			}
		}
		return any_scripts_ready;
	}

	// creates a script load listener
	function create_script_load_listener(elem,registry_item,flag,onload) {
		elem.onload = elem.onreadystatechange = function() {
			if ((elem.readyState && elem.readyState != "complete" && elem.readyState != "loaded") || registry_item[flag]) return;
			elem.onload = elem.onreadystatechange = null;
			onload();
		};
	}

	// script executed handler
	function script_executed(registry_item) {
		registry_item.ready = registry_item.finished = true;
		for (var i=0; i<registry_item.finished_listeners.length; i++) {
			registry_item.finished_listeners[i]();
		}
		registry_item.ready_listeners = [];
		registry_item.finished_listeners = [];
	}

	// make the request for a scriptha
	function request_script(chain_opts,script_obj,registry_item,onload,preload_this_script) {
		// setTimeout() "yielding" prevents some weird race/crash conditions in older browsers
		setTimeout(function(){
			var script, src = script_obj.real_src, xhr;
			
			// don't proceed until `append_to` is ready to append to
			if ("item" in append_to) { // check if `append_to` ref is still a live node list
				if (!append_to[0]) { // `append_to` node not yet ready
					// try again in a little bit -- note: will re-call the anonymous function in the outer setTimeout, not the parent `request_script()`
					setTimeout(arguments.callee,25);
					return;
				}
				// reassign from live node list ref to pure node ref -- avoids nasty IE bug where changes to DOM invalidate live node lists
				append_to = append_to[0];
			}
			script = document.createElement("script");
			if (script_obj.type) script.type = script_obj.type;
			if (script_obj.charset) script.charset = script_obj.charset;
			
			// should preloading be used for this script?
			if (preload_this_script) {
				// real script preloading?
				if (real_preloading) {
					/*!START_DEBUG*/if (chain_opts[_Debug]) log_msg("start script preload: "+src);/*!END_DEBUG*/
					registry_item.elem = script;
					if (explicit_preloading) { // explicit preloading (aka, Zakas' proposal)
						script.preload = true;
						script.onpreload = onload;
					}
					else {
						script.onreadystatechange = function(){
							if (script.readyState == "loaded") onload();
						};
					}
					script.src = src;
					// NOTE: no append to DOM yet, appending will happen when ready to execute
				}
				// same-domain and XHR allowed? use XHR preloading
				else if (preload_this_script && src.indexOf(root_domain) == 0 && chain_opts[_UseLocalXHR]) {
					xhr = new XMLHttpRequest(); // note: IE never uses XHR (it supports true preloading), so no more need for ActiveXObject fallback for IE <= 7
					/*!START_DEBUG*/if (chain_opts[_Debug]) log_msg("start script preload (xhr): "+src);/*!END_DEBUG*/
					xhr.onreadystatechange = function() {
						if (xhr.readyState == 4) {
							xhr.onreadystatechange = function(){}; // fix a memory leak in IE
							registry_item.text = xhr.responseText + "\n//@ sourceURL=" + src; // http://blog.getfirebug.com/2009/08/11/give-your-eval-a-name-with-sourceurl/
							onload();
						}
					};
					xhr.open("GET",src);
					xhr.send();
				}
				// as a last resort, use cache-preloading
				else {
					/*!START_DEBUG*/if (chain_opts[_Debug]) log_msg("start script preload (cache): "+src);/*!END_DEBUG*/
					script.type = "text/cache-script";
					create_script_load_listener(script,registry_item,"ready",function() {
						append_to.removeChild(script);
						onload();
					});
					script.src = src;
					append_to.insertBefore(script,append_to.firstChild);
				}
			}
			// use async=false for ordered async? parallel-load-serial-execute http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
			else if (script_ordered_async) {
				/*!START_DEBUG*/if (chain_opts[_Debug]) log_msg("start script load (ordered async): "+src);/*!END_DEBUG*/
				script.async = false;
				create_script_load_listener(script,registry_item,"finished",onload);
				script.src = src;
				append_to.insertBefore(script,append_to.firstChild);
			}
			// otherwise, just a normal script element
			else {
				/*!START_DEBUG*/if (chain_opts[_Debug]) log_msg("start script load: "+src);/*!END_DEBUG*/
				create_script_load_listener(script,registry_item,"finished",onload);
				script.src = src;
				append_to.insertBefore(script,append_to.firstChild);
			}
		},0);
	}
		
	// create a clean instance of $LAB
	function create_sandbox() {
		var global_defaults = {},
			can_use_preloading = real_preloading || xhr_or_cache_preloading,
			queue = [],
			registry = {},
			instanceAPI
		;
		
		// global defaults
		global_defaults[_UseLocalXHR] = true;
		global_defaults[_AlwaysPreserveOrder] = false;
		global_defaults[_AllowDuplicates] = false;
		global_defaults[_CacheBust] = false;
		/*!START_DEBUG*/global_defaults[_Debug] = false;/*!END_DEBUG*/
		global_defaults[_BasePath] = "";

		// execute a script that has been preloaded already
		function execute_preloaded_script(chain_opts,script_obj,registry_item) {
			var script;
			
			function preload_execute_finished() {
				if (script != null) { // make sure this only ever fires once
					script = null;
					script_executed(registry_item);
				}
			}
			
			if (registry[script_obj.src].finished) return;
			if (!chain_opts[_AllowDuplicates]) registry[script_obj.src].finished = true;
			
			script = registry_item.elem || document.createElement("script");
			if (script_obj.type) script.type = script_obj.type;
			if (script_obj.charset) script.charset = script_obj.charset;
			create_script_load_listener(script,registry_item,"finished",preload_execute_finished);
			
			// script elem was real-preloaded
			if (registry_item.elem) {
				registry_item.elem = null;
			}
			// script was XHR preloaded
			else if (registry_item.text) {
				script.onload = script.onreadystatechange = null;	// script injection doesn't fire these events
				script.text = registry_item.text;
			}
			// script was cache-preloaded
			else {
				script.src = script_obj.real_src;
			}
			append_to.insertBefore(script,append_to.firstChild);

			// manually fire execution callback for injected scripts, since events don't fire
			if (registry_item.text) {
				preload_execute_finished();
			}
		}
	
		// process the script request setup
		function do_script(chain_opts,script_obj,chain_group,preload_this_script) {
			var registry_item,
				registry_items,
				ready_cb = function(){ script_obj.ready_cb(script_obj,function(){ execute_preloaded_script(chain_opts,script_obj,registry_item); }); },
				finished_cb = function(){ script_obj.finished_cb(script_obj,chain_group); }
			;
			
			script_obj.src = canonical_uri(script_obj.src,chain_opts[_BasePath]);
			script_obj.real_src = script_obj.src + 
				// append cache-bust param to URL?
				(chain_opts[_CacheBust] ? ((/\?.*$/.test(script_obj.src) ? "&_" : "?_") + ~~(Math.random()*1E9) + "=") : "")
			;
			
			if (!registry[script_obj.src]) registry[script_obj.src] = {items:[],finished:false};
			registry_items = registry[script_obj.src].items;

			// allowing duplicates, or is this the first recorded load of this script?
			if (chain_opts[_AllowDuplicates] || registry_items.length == 0) {
				registry_item = registry_items[registry_items.length] = {
					ready:false,
					finished:false,
					ready_listeners:[ready_cb],
					finished_listeners:[finished_cb]
				};

				request_script(chain_opts,script_obj,registry_item,
					// which callback type to pass?
					(
					 	(preload_this_script) ? // depends on script-preloading
						function(){
							registry_item.ready = true;
							for (var i=0; i<registry_item.ready_listeners.length; i++) {
								registry_item.ready_listeners[i]();
							}
							registry_item.ready_listeners = [];
						} :
						function(){ script_executed(registry_item); }
					),
					// signal if script-preloading should be used or not
					preload_this_script
				);
			}
			else {
				registry_item = registry_items[0];
				if (registry_item.finished) {
					finished_cb();
				}
				else {
					registry_item.finished_listeners.push(finished_cb);
				}
			}
		}

		// creates a closure for each separate chain spawned from this $LAB instance, to keep state cleanly separated between chains
		function create_chain() {
			var chainedAPI,
				chain_opts = merge_objs(global_defaults,{}),
				chain = [],
				exec_cursor = 0,
				scripts_currently_loading = false,
				group
			;
			
			// called when a script has finished preloading
			function chain_script_ready(script_obj,exec_trigger) {
				/*!START_DEBUG*/if (chain_opts[_Debug]) log_msg("script preload finished: "+script_obj.real_src);/*!END_DEBUG*/
				script_obj.ready = true;
				script_obj.exec_trigger = exec_trigger;
				advance_exec_cursor(); // will only check for 'ready' scripts to be executed
			}

			// called when a script has finished executing
			function chain_script_executed(script_obj,chain_group) {
				/*!START_DEBUG*/if (chain_opts[_Debug]) log_msg("script execution finished: "+script_obj.real_src);/*!END_DEBUG*/
				script_obj.ready = script_obj.finished = true;
				script_obj.exec_trigger = null;
				// check if chain group is all finished
				for (var i=0; i<chain_group.scripts.length; i++) {
					if (!chain_group.scripts[i].finished) return;
				}
				// chain_group is all finished if we get this far
				chain_group.finished = true;
				advance_exec_cursor();
			}

			// main driver for executing each part of the chain
			function advance_exec_cursor() {
				while (exec_cursor < chain.length) {
					if (is_func(chain[exec_cursor])) {
						/*!START_DEBUG*/if (chain_opts[_Debug]) log_msg("$LAB.wait() executing: "+chain[exec_cursor]);/*!END_DEBUG*/
						try { chain[exec_cursor++](); } catch (err) {
							/*!START_DEBUG*/if (chain_opts[_Debug]) log_error("$LAB.wait() error caught: ",err);/*!END_DEBUG*/
						}
						continue;
					}
					else if (!chain[exec_cursor].finished) {
						if (check_chain_group_scripts_ready(chain[exec_cursor])) continue;
						break;
					}
					exec_cursor++;
				}
				// we've reached the end of the chain (so far)
				if (exec_cursor == chain.length) {
					scripts_currently_loading = false;
					group = false;
				}
			}
			
			// setup next chain script group
			function init_script_chain_group() {
				if (!group || !group.scripts) {
					chain.push(group = {scripts:[],finished:true});
				}
			}

			// API for $LAB chains
			chainedAPI = {
				// start loading one or more scripts
				script:function(){
					for (var i=0; i<arguments.length; i++) {
						(function(script_obj,script_list){
							var splice_args;
							
							if (!is_array(script_obj)) {
								script_list = [script_obj];
							}
							for (var j=0; j<script_list.length; j++) {
								init_script_chain_group();
								script_obj = script_list[j];
								
								if (is_func(script_obj)) script_obj = script_obj();
								if (!script_obj) continue;
								if (is_array(script_obj)) {
									// set up an array of arguments to pass to splice()
									splice_args = [].slice.call(script_obj); // first include the actual array elements we want to splice in
									splice_args.unshift(j,1); // next, put the `index` and `howMany` parameters onto the beginning of the splice-arguments array
									[].splice.apply(script_list,splice_args); // use the splice-arguments array as arguments for splice()
									j--; // adjust `j` to account for the loop's subsequent `j++`, so that the next loop iteration uses the same `j` index value
									continue;
								}
								if (typeof script_obj == "string") script_obj = {src:script_obj};
								script_obj = merge_objs(script_obj,{
									ready:false,
									ready_cb:chain_script_ready,
									finished:false,
									finished_cb:chain_script_executed
								});
								group.finished = false;
								group.scripts.push(script_obj);
								
								do_script(chain_opts,script_obj,group,(can_use_preloading && scripts_currently_loading));
								scripts_currently_loading = true;
								
								if (chain_opts[_AlwaysPreserveOrder]) chainedAPI.wait();
							}
						})(arguments[i],arguments[i]);
					}
					return chainedAPI;
				},
				// force LABjs to pause in execution at this point in the chain, until the execution thus far finishes, before proceeding
				wait:function(){
					if (arguments.length > 0) {
						for (var i=0; i<arguments.length; i++) {
							chain.push(arguments[i]);
						}
						group = chain[chain.length-1];
					}
					else group = false;
					
					advance_exec_cursor();
					
					return chainedAPI;
				}
			};

			// the first chain link API (includes `setOptions` only this first time)
			return {
				script:chainedAPI.script, 
				wait:chainedAPI.wait, 
				setOptions:function(opts){
					merge_objs(opts,chain_opts);
					return chainedAPI;
				}
			};
		}

		// API for each initial $LAB instance (before chaining starts)
		instanceAPI = {
			// main API functions
			setGlobalDefaults:function(opts){
				merge_objs(opts,global_defaults);
				return instanceAPI;
			},
			setOptions:function(){
				return create_chain().setOptions.apply(null,arguments);
			},
			script:function(){
				return create_chain().script.apply(null,arguments);
			},
			wait:function(){
				return create_chain().wait.apply(null,arguments);
			},

			// built-in queuing for $LAB `script()` and `wait()` calls
			// useful for building up a chain programmatically across various script locations, and simulating
			// execution of the chain
			queueScript:function(){
				queue[queue.length] = {type:"script", args:[].slice.call(arguments)};
				return instanceAPI;
			},
			queueWait:function(){
				queue[queue.length] = {type:"wait", args:[].slice.call(arguments)};
				return instanceAPI;
			},
			runQueue:function(){
				var $L = instanceAPI, len=queue.length, i=len, val;
				for (;--i>=0;) {
					val = queue.shift();
					$L = $L[val.type].apply(null,val.args);
				}
				return $L;
			},

			// rollback `[global].$LAB` to what it was before this file was loaded, the return this current instance of $LAB
			noConflict:function(){
				global.$LAB = _$LAB;
				return instanceAPI;
			},

			// create another clean instance of $LAB
			sandbox:function(){
				return create_sandbox();
			}
		};

		return instanceAPI;
	}

	// create the main instance of $LAB
	global.$LAB = create_sandbox();


	/* The following "hack" was suggested by Andrea Giammarchi and adapted from: http://webreflection.blogspot.com/2009/11/195-chars-to-help-lazy-loading.html
	   NOTE: this hack only operates in FF and then only in versions where document.readyState is not present (FF < 3.6?).
	   
	   The hack essentially "patches" the **page** that LABjs is loaded onto so that it has a proper conforming document.readyState, so that if a script which does 
	   proper and safe dom-ready detection is loaded onto a page, after dom-ready has passed, it will still be able to detect this state, by inspecting the now hacked 
	   document.readyState property. The loaded script in question can then immediately trigger any queued code executions that were waiting for the DOM to be ready. 
	   For instance, jQuery 1.4+ has been patched to take advantage of document.readyState, which is enabled by this hack. But 1.3.2 and before are **not** safe or 
	   fixed by this hack, and should therefore **not** be lazy-loaded by script loader tools such as LABjs.
	*/ 
	(function(addEvent,domLoaded,handler){
		if (document.readyState == null && document[addEvent]){
			document.readyState = "loading";
			document[addEvent](domLoaded,handler = function(){
				document.removeEventListener(domLoaded,handler,false);
				document.readyState = "complete";
			},false);
		}
	})("addEventListener","DOMContentLoaded");

})(this);
/* ---------------------------------------------------------------------------
WAIT! - This file depends on instructions from the PUBNUB Cloud.
http://www.pubnub.com/account-javascript-api-include
--------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
PubNub Real-time Cloud-Hosted Push API and Push Notification Client Frameworks
Copyright (c) 2011 PubNub Inc.
http://www.pubnub.com/
http://www.pubnub.com/terms
--------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
--------------------------------------------------------------------------- */

/* =-====================================================================-= */
/* =-====================================================================-= */
/* =-=========================     JSON     =============================-= */
/* =-====================================================================-= */
/* =-====================================================================-= */

(window['JSON'] && window['JSON']['stringify']) || (function () {
    window['JSON'] || (window['JSON'] = {});

    if (typeof String.prototype.toJSON !== 'function') {
        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {
        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':
            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':
            return String(value);

        case 'object':

            if (!value) {
                return 'null';
            }

            gap += indent;
            partial = [];

            if (Object.prototype.toString.apply(value) === '[object Array]') {

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }
            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {
                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

    if (typeof JSON['stringify'] !== 'function') {
        JSON['stringify'] = function (value, replacer, space) {
            var i;
            gap = '';
            indent = '';

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
            } else if (typeof space === 'string') {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }
            return str('', {'': value});
        };
    }

    if (typeof JSON['parse'] !== 'function') {
        // JSON is parsed on the server for security.
        JSON['parse'] = function (text) {return eval('('+text+')')};
    }
}());


/* =-====================================================================-= */
/* =-====================================================================-= */
/* =-=======================     DOM UTIL     ===========================-= */
/* =-====================================================================-= */
/* =-====================================================================-= */

window['PUBNUB'] || (function() {

/**
 * CONSOLE COMPATIBILITY
 */
window.console||(window.console=window.console||{});
console.log||(console.log=((window.opera||{}).postError||function(){}));

/**
 * UTILITIES
 */
function unique() { return'x'+ ++NOW+''+(+new Date) }
function rnow() { return+new Date }

/**
 * LOCAL STORAGE OR COOKIE
 */
var db = (function(){
    var ls = window['localStorage'];
    return {
        get : function(key) {
            try {
                if (ls) return ls.getItem(key);
                if (document.cookie.indexOf(key) == -1) return null;
                return ((document.cookie||'').match(
                    RegExp(key+'=([^;]+)')
                )||[])[1] || null;
            } catch(e) { return }
        },
        set : function( key, value ) {
            try {
                if (ls) return ls.setItem( key, value ) && 0;
                document.cookie = key + '=' + value +
                    '; expires=Thu, 1 Aug 2030 20:00:00 UTC; path=/';
            } catch(e) { return }
        }
    };
})();

/**
 * UTIL LOCALS
 */
var NOW    = 1
,   SWF    = 'https://dh15atwfs066y.cloudfront.net/pubnub.swf'
,   REPL   = /{([\w\-]+)}/g
,   ASYNC  = 'async'
,   URLBIT = '/'
,   XHRTME = 140000
,   SECOND = 1000
,   UA     = navigator.userAgent
,   XORIGN = UA.indexOf('MSIE 6') == -1;

/**
 * NEXTORIGIN
 * ==========
 * var next_origin = nextorigin();
 */
var nextorigin = (function() {
    var ori = Math.floor(Math.random() * 9) + 1;
    return function(origin) {
        return origin.indexOf('pubsub') > 0
            && origin.replace(
             'pubsub', 'ps' + (++ori < 10 ? ori : ori=1)
            ) || origin;
    }
})();

/**
 * UPDATER
 * ======
 * var timestamp = unique();
 */
function updater( fun, rate ) {
    var timeout
    ,   last   = 0
    ,   runnit = function() {
        if (last + rate > rnow()) {
            clearTimeout(timeout);
            timeout = setTimeout( runnit, rate );
        }
        else {
            last = rnow();
            fun();
        }
    };

    return runnit;
}

/**
 * $
 * =
 * var div = $('divid');
 */
function $(id) { return document.getElementById(id) }

/**
 * LOG
 * ===
 * log('message');
 */
function log(message) { console['log'](message) }

/**
 * SEARCH
 * ======
 * var elements = search('a div span');
 */
function search( elements, start ) {
    var list = [];
    each( elements.split(/\s+/), function(el) {
        each( (start || document).getElementsByTagName(el), function(node) {
            list.push(node);
        } );
    } );
    return list;
}

/**
 * EACH
 * ====
 * each( [1,2,3], function(item) { console.log(item) } )
 */
function each( o, f ) {
    if ( !o || !f ) return;

    if ( typeof o[0] != 'undefined' )
        for ( var i = 0, l = o.length; i < l; )
            f.call( o[i], o[i], i++ );
    else
        for ( var i in o )
            o.hasOwnProperty    &&
            o.hasOwnProperty(i) &&
            f.call( o[i], i, o[i] );
}

/**
 * MAP
 * ===
 * var list = map( [1,2,3], function(item) { return item + 1 } )
 */
function map( list, fun ) {
    var fin = [];
    each( list || [], function( k, v ) { fin.push(fun( k, v )) } );
    return fin;
}

/**
 * GREP
 * ====
 * var list = grep( [1,2,3], function(item) { return item % 2 } )
 */
function grep( list, fun ) {
    var fin = [];
    each( list || [], function(l) { fun(l) && fin.push(l) } );
    return fin
}

/**
 * SUPPLANT
 * ========
 * var text = supplant( 'Hello {name}!', { name : 'John' } )
 */
function supplant( str, values ) {
    return str.replace( REPL, function( _, match ) {
        return values[match] || _
    } );
}

/**
 * BIND
 * ====
 * bind( 'keydown', search('a')[0], function(element) {
 *     console.log( element, '1st anchor' )
 * } );
 */
function bind( type, el, fun ) {
    each( type.split(','), function(etype) {
        var rapfun = function(e) {
            if (!e) e = window.event;
            if (!fun(e)) {
                e.cancelBubble = true;
                e.returnValue  = false;
                e.preventDefault && e.preventDefault();
                e.stopPropagation && e.stopPropagation();
            }
        };

        if ( el.addEventListener ) el.addEventListener( etype, rapfun, false );
        else if ( el.attachEvent ) el.attachEvent( 'on' + etype, rapfun );
        else  el[ 'on' + etype ] = rapfun;
    } );
}

/**
 * UNBIND
 * ======
 * unbind( 'keydown', search('a')[0] );
 */
function unbind( type, el, fun ) {
    if ( el.removeEventListener ) el.removeEventListener( type, false );
    else if ( el.detachEvent ) el.detachEvent( 'on' + type, false );
    else  el[ 'on' + type ] = null;
}

/**
 * HEAD
 * ====
 * head().appendChild(elm);
 */
function head() { return search('head')[0] }

/**
 * ATTR
 * ====
 * var attribute = attr( node, 'attribute' );
 */
function attr( node, attribute, value ) {
    if (value) node.setAttribute( attribute, value );
    else return node && node.getAttribute && node.getAttribute(attribute);
}

/**
 * CSS
 * ===
 * var obj = create('div');
 */
function css( element, styles ) {
    for (var style in styles) if (styles.hasOwnProperty(style))
        try {element.style[style] = styles[style] + (
            '|width|height|top|left|'.indexOf(style) > 0 &&
            typeof styles[style] == 'number'
            ? 'px' : ''
        )}catch(e){}
}

/**
 * CREATE
 * ======
 * var obj = create('div');
 */
function create(element) { return document.createElement(element) }

/**
 * timeout
 * =======
 * timeout( function(){}, 100 );
 */
function timeout( fun, wait ) {
    return setTimeout( fun, wait );
}

/**
 * jsonp_cb
 * ========
 * var callback = jsonp_cb();
 */
function jsonp_cb() { return XORIGN || FDomainRequest() ? 0 : unique() }

/**
 * ENCODE
 * ======
 * var encoded_path = encode('path');
 */
function encode(path) {
    return map( (encodeURIComponent(path)).split(''), function(chr) {
        return "-_.!~*'()".indexOf(chr) < 0 ? chr :
               "%"+chr.charCodeAt(0).toString(16).toUpperCase()
    } ).join('');
}

/**
 * EVENTS
 * ======
 * PUBNUB.events.bind( 'you-stepped-on-flower', function(message) {
 *     // Do Stuff with message
 * } );
 *
 * PUBNUB.events.fire( 'you-stepped-on-flower', "message-data" );
 * PUBNUB.events.fire( 'you-stepped-on-flower', {message:"data"} );
 * PUBNUB.events.fire( 'you-stepped-on-flower', [1,2,3] );
 *
 */
var events = {
    'list'   : {},
    'unbind' : function( name ) { events.list[name] = [] },
    'bind'   : function( name, fun ) {
        (events.list[name] = events.list[name] || []).push(fun);
    },
    'fire' : function( name, data ) {
        each(
            events.list[name] || [],
            function(fun) { fun(data) }
        );
    }
};

/**
 * XDR Cross Domain Request
 * ========================
 *  xdr({
 *     url     : ['http://www.blah.com/url'],
 *     success : function(response) {},
 *     fail    : function() {}
 *  });
 */
function xdr( setup ) {
    if (XORIGN || FDomainRequest()) return ajax(setup);

    var script    = create('script')
    ,   callback  = setup.callback
    ,   id        = unique()
    ,   finished  = 0
    ,   timer     = timeout( function(){done(1)}, XHRTME )
    ,   fail      = setup.fail    || function(){}
    ,   success   = setup.success || function(){}

    ,   append = function() {
            head().appendChild(script);
        }

    ,   done = function( failed, response ) {
            if (finished) return;
                finished = 1;

            failed || success(response);
            script.onerror = null;
            clearTimeout(timer);

            timeout( function() {
                failed && fail();
                var s = $(id)
                ,   p = s && s.parentNode;
                p && p.removeChild(s);
            }, SECOND );
        };

    window[callback] = function(response) {
        done( 0, response );
    };

    script[ASYNC]  = ASYNC;
    script.onerror = function() { done(1) };
    script.src     = setup.url.join(URLBIT);

    attr( script, 'id', id );

    append();
    return done;
}

/**
 * CORS XHR Request
 * ================
 *  xdr({
 *     url     : ['http://www.blah.com/url'],
 *     success : function(response) {},
 *     fail    : function() {}
 *  });
 */
function ajax( setup ) {
    var xhr
    ,   finished = function() {
            if (loaded) return;
                loaded = 1;

            clearTimeout(timer);

            try       { response = JSON['parse'](xhr.responseText); }
            catch (r) { return done(1); }

            success(response);
        }
    ,   complete = 0
    ,   loaded   = 0
    ,   timer    = timeout( function(){done(1)}, XHRTME )
    ,   fail     = setup.fail    || function(){}
    ,   success  = setup.success || function(){}
    ,   done     = function(failed) {
            if (complete) return;
                complete = 1;

            clearTimeout(timer);

            if (xhr) {
                xhr.onerror = xhr.onload = null;
                xhr.abort && xhr.abort();
                xhr = null;
            }

            failed && fail();
        };

    // Send
    try {
        xhr = FDomainRequest()      ||
              window.XDomainRequest &&
              new XDomainRequest()  ||
              new XMLHttpRequest();

        xhr.onerror = xhr.onabort   = function(){ done(1) };
        xhr.onload  = xhr.onloadend = finished;
        xhr.timeout = XHRTME;

        xhr.open( 'GET', setup.url.join(URLBIT), true );
        xhr.send();
    }
    catch(eee) {
        done(0);
        XORIGN = 0;
        return xdr(setup);
    }

    // Return 'done'
    return done;
}


/* =-====================================================================-= */
/* =-====================================================================-= */
/* =-=========================     PUBNUB     ===========================-= */
/* =-====================================================================-= */
/* =-====================================================================-= */

var PDIV          = $('pubnub') || {}
,   READY         = 0
,   READY_BUFFER  = []
,   CREATE_PUBNUB = function(setup) {
    var CHANNELS      = {}
    ,   PUBLISH_KEY   = setup['publish_key']   || villo.app.pubnub.pub
    ,   SUBSCRIBE_KEY = setup['subscribe_key'] || villo.app.pubnub.sub
    ,   SSL           = setup['ssl'] ? 's' : ''
    ,   ORIGIN        = 'http'+SSL+'://'+(setup['origin']||'pubsub.pubnub.com')
    ,   SELF          = {
        /*
            PUBNUB.history({
                channel  : 'my_chat_channel',
                limit    : 100,
                callback : function(messages) { console.log(messages) }
            });
        */
        'history' : function( args, callback ) {
            var callback = args['callback'] || callback 
            ,   limit    = args['limit'] || 100
            ,   channel  = args['channel']
            ,   jsonp    = jsonp_cb();

            // Make sure we have a Channel
            if (!channel)  return log('Missing Channel');
            if (!callback) return log('Missing Callback');

            // Send Message
            xdr({
                callback : jsonp,
                url      : [
                    ORIGIN, 'history',
                    SUBSCRIBE_KEY, encode(channel),
                    jsonp, limit
                ],
                success  : function(response) { callback(response) },
                fail     : function(response) { log(response) }
            });
        },

        /*
            PUBNUB.time(function(time){ console.log(time) });
        */
        'time' : function(callback) {
            var jsonp = jsonp_cb();
            xdr({
                callback : jsonp,
                url      : [ORIGIN, 'time', jsonp],
                success  : function(response) { callback(response[0]) },
                fail     : function() { callback(0) }
            });
        },

        /*
            PUBNUB.uuid(function(uuid) { console.log(uuid) });
        */
        'uuid' : function(callback) {
            var jsonp = jsonp_cb();
            xdr({
                callback : jsonp,
                url      : [
                    'http' + SSL +
                    '://pubnub-prod.appspot.com/uuid?callback=' + jsonp
                ],
                success  : function(response) { callback(response[0]) },
                fail     : function() { callback(0) }
            });
        },

        /*
            PUBNUB.publish({
                channel : 'my_chat_channel',
                message : 'hello!'
            });
        */
        'publish' : function( args, callback ) {
            var callback = callback || args['callback'] || function(){}
            ,   message  = args['message']
            ,   channel  = args['channel']
            ,   jsonp    = jsonp_cb()
            ,   url;

            if (!message)     return log('Missing Message');
            if (!channel)     return log('Missing Channel');
            if (!PUBLISH_KEY) return log('Missing Publish Key');

            // If trying to send Object
            message = JSON['stringify'](message);

            // Create URL
            url = [
                ORIGIN, 'publish',
                PUBLISH_KEY, SUBSCRIBE_KEY,
                0, encode(channel),
                jsonp, encode(message)
            ];

            // Send Message
            xdr({
                callback : jsonp,
                success  : function(response) { callback(response) },
                fail     : function() { callback([ 0, 'Disconnected' ]) },
                url      : url
            });
        },

        /*
            PUBNUB.unsubscribe({ channel : 'my_chat' });
        */
        'unsubscribe' : function(args) {
            var channel = args['channel'];

            // Leave if there never was a channel.
            if (!(channel in CHANNELS)) return;

            // Disable Channel
            CHANNELS[channel].connected = 0;

            // Abort and Remove Script
            CHANNELS[channel].done && 
            CHANNELS[channel].done(0);
        },

        /*
            PUBNUB.subscribe({
                channel  : 'my_chat'
                callback : function(message) { console.log(message) }
            });
        */
        'subscribe' : function( args, callback ) {

            var channel      = args['channel']
            ,   callback     = callback || args['callback']
            ,   restore      = args['restore']
            ,   timetoken    = 0
            ,   error        = args['error'] || function(){}
            ,   connect      = args['connect'] || function(){}
            ,   reconnect    = args['reconnect'] || function(){}
            ,   disconnect   = args['disconnect'] || function(){}
            ,   disconnected = 0
            ,   connected    = 0
            ,   origin       = nextorigin(ORIGIN);

            // Reduce Status Flicker
            if (!READY) return READY_BUFFER.push([ args, callback, SELF ]);

            // Make sure we have a Channel
            if (!channel)       return log('Missing Channel');
            if (!callback)      return log('Missing Callback');
            if (!SUBSCRIBE_KEY) return log('Missing Subscribe Key');

            if (!(channel in CHANNELS)) CHANNELS[channel] = {};

            // Make sure we have a Channel
            if (CHANNELS[channel].connected) return log('Already Connected');
                CHANNELS[channel].connected = 1;

            // Recurse Subscribe
            function pubnub() {
                var jsonp = jsonp_cb();

                // Stop Connection
                if (!CHANNELS[channel].connected) return;

                // Connect to PubNub Subscribe Servers
                CHANNELS[channel].done = xdr({
                    callback : jsonp,
                    url      : [
                        origin, 'subscribe',
                        SUBSCRIBE_KEY, encode(channel),
                        jsonp, timetoken
                    ],
                    fail : function() {
                        // Disconnect
                        if (!disconnected) {
                            disconnected = 1;
                            disconnect();
                        }
                        timeout( pubnub, SECOND );
                        SELF['time'](function(success){
                            success || error();
                        });
                    },
                    success : function(messages) {
                        if (!CHANNELS[channel].connected) return;

                        // Connect
                        if (!connected) {
                            connected = 1;
                            connect();
                        }

                        // Reconnect
                        if (disconnected) {
                            disconnected = 0;
                            reconnect();
                        }

                        // Restore Previous Connection Point if Needed
                        // Also Update Timetoken
                        restore = db.set(
                            SUBSCRIBE_KEY + channel,
                            timetoken = restore && db.get(
                                SUBSCRIBE_KEY + channel
                            ) || messages[1]
                        );

                        each( messages[0], function(msg) {
                            callback( msg, messages );
                        } );

                        timeout( pubnub, 10 );
                    }
                });
            }

            // Begin Recursive Subscribe
            pubnub();
        },

        // Expose PUBNUB Functions
        'xdr'      : xdr,
        'ready'    : ready,
        'db'       : db,
        'each'     : each,
        'map'      : map,
        'css'      : css,
        '$'        : $,
        'create'   : create,
        'bind'     : bind,
        'supplant' : supplant,
        'head'     : head,
        'search'   : search,
        'attr'     : attr,
        'now'      : rnow,
        'unique'   : unique,
        'events'   : events,
        'updater'  : updater,
        'init'     : CREATE_PUBNUB
    };

    return SELF;
};

// CREATE A PUBNUB GLOBAL OBJECT
PUBNUB = CREATE_PUBNUB({
    'publish_key'   : attr( PDIV, 'pub-key' ),
    'subscribe_key' : attr( PDIV, 'sub-key' ),
    'ssl'           : attr( PDIV, 'ssl' ) == 'on',
    'origin'        : attr( PDIV, 'origin' )
});

// PUBNUB Flash Socket
css( PDIV, { 'position' : 'absolute', 'top' : -SECOND } );

if ('opera' in window || attr( PDIV, 'flash' )) PDIV['innerHTML'] =
    '<object id=pubnubs data='  + SWF +
    '><param name=movie value=' + SWF +
    '><param name=allowscriptaccess value=always></object>';

var pubnubs = $('pubnubs') || {};

// PUBNUB READY TO CONNECT
function ready() { PUBNUB['time'](rnow);
PUBNUB['time'](function(t){ timeout( function() {
    if (READY) return;
    READY = 1;
    each( READY_BUFFER, function(sub) {
        sub[2]['subscribe']( sub[0], sub[1] )
    } );
}, SECOND ); }); }

// Bind for PUBNUB Readiness to Subscribe
bind( 'load', window, function(){ timeout( ready, 0 ) } );

// Create Interface for Opera Flash
PUBNUB['rdx'] = function( id, data ) {
    if (!data) return FDomainRequest[id]['onerror']();
    FDomainRequest[id]['responseText'] = unescape(data);
    FDomainRequest[id]['onload']();
};

function FDomainRequest() {
    if (!pubnubs['get']) return 0;

    var fdomainrequest = {
        'id'    : FDomainRequest['id']++,
        'send'  : function() {},
        'abort' : function() { fdomainrequest['id'] = {} },
        'open'  : function( method, url ) {
            FDomainRequest[fdomainrequest['id']] = fdomainrequest;
            pubnubs['get']( fdomainrequest['id'], url );
        }
    };

    return fdomainrequest;
}
FDomainRequest['id'] = SECOND;

// jQuery Interface
window['jQuery'] && (window['jQuery']['PUBNUB'] = PUBNUB);

// For Testling.js - http://testling.com/
typeof module !== 'undefined' && (module.exports = PUBNUB) && ready();

})();