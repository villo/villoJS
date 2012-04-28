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

(function( window, undefined ) {
	villo = window.villo || {};
	
	villo.apiKey = "";
	villo.version = "0.9.9 p1";
})(window);
/* Villo Analytics */
//TODO: For 1.0 release.

/* Villo Bridge */
(function(){
/*
 * Villo Bridge allows for accelerated Villo development, giving developers a simple method for viewing Villo content.
 */

	
	//TODO: 
	//iFrames?
	//Cross-origin?
	//Security?
	//Pass Div + iFrame set content
	
	
})();

/* Villo Push Chat */
(function(){
	villo.chat = {
		rooms: [],

/**
	villo.chat.join
	==================
	
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
			username: "Kesne",
			message: "Hey man, how's it going?"
		}
		
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
			if ('PUBNUB' in window) {
				if (villo.chat.isSubscribed(chatObject.room) == false) {
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
					
					if(chatObject.presence && chatObject.presence.enabled && chatObject.presence.enabled == true){
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
			for (x in villo.chat.rooms) {
				if (villo.chat.rooms.hasOwnProperty(x)) {
					if (villo.chat.rooms[x].name.toUpperCase() == roomString.toUpperCase()) {
						c = true;
					}
				}
			}
			return c;
		},
/**
	villo.chat.send
	==================
	
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
					"message": messageObject.message
				};
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
	==================
	
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
				for (x in villo.chat.rooms) {
					if (villo.chat.rooms.hasOwnProperty(x)) {
						PUBNUB.unsubscribe({
							channel: "VILLO/CHAT/" + villo.app.id.toUpperCase() + "/" + villo.chat.rooms[x].name.toUpperCase()
						});
						if(villo.chat.rooms[x].presence && villo.chat.rooms[x].presence == true){
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
	==================
	
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
				var x;
				for (x in villo.chat.rooms) {
					if (villo.chat.rooms.hasOwnProperty(x)) {
						if (villo.chat.rooms[x].name == closerObject) {
							var rmv = x;
							if(villo.chat.rooms[x].presence && villo.chat.rooms[x].presence == true){
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
	}
	/*
	 * TODO:
	 * Document out the presence APIs.
	 * 
	 * TODO:
	 * Run extensive tests on this API.
	 * 
	 * TODO:
	 * Eventually swap this out with some socketIO sweetness.
	 */
	villo.presence = {
			rooms: {},
			
			join: function(joinObject){
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
				
				/*
				 * Announce our first presence, then keep announcing it.
				 */
				
				PUBNUB.publish({
					channel: "VILLO/PRESENCE/" + villo.app.id.toUpperCase() + "/" + joinObject.room.toUpperCase(),
					message: {
						name: 'user-presence',
						data: {
							username: villo.user.username,
						}
					}
				});
				
				this._intervals[joinObject.room] = window.setInterval(function(){
					PUBNUB.publish({
						channel: "VILLO/PRESENCE/" + villo.app.id.toUpperCase() + "/" + joinObject.room.toUpperCase(),
						message: {
							name: 'user-presence',
							data: {
								username: villo.user.username,
							}
						}
					});
				}, 3000);
				
				return true;
			},
			//Also use get as a medium to access villo.presence.get
			get: function(getObject){
				//TODO: Check to see if we're already subscribed. If we are, we can pass them the current object, we don't need to go through this process.
				this._get[getObject.room] = {}
				
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
						channel: "VILLO/PRESENCE/" + villo.app.id.toUpperCase() + "/" + getObject.room.toUpperCase(),
					});
					var returnObject = {
						room: getObject.room,
						users: []
					};
					for(x in villo.presence._get[getObject.room]){
						returnObject.users.push(villo.presence._get[getObject.room][x].username);
					}
					getObject.callback(returnObject);
				}, 4000);
			},
			
			leave: function(leaveObject){
				PUBNUB.unsubscribe({
					channel: "VILLO/PRESENCE/" + villo.app.id.toUpperCase() + "/" + leaveObject.room.toUpperCase(),
				});
				clearInterval(this._intervals[leaveObject.room]);
				delete this._intervals[leaveObject.room];
				delete this._timeouts[leaveObject.room];
				delete this.rooms[leaveObject.room];
				return true;
			},
			
			/*
			 * @private
			 * These are the private variables, they should only be referenced by the Villo framework itself.
			 */
			_timeouts: {},
			_intervals: {},
			_get: {},
		}
})();
/* Villo Clipboard */
(function(){
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
	}
})();

/* Villo Public Feeds */
(function(){
	villo.feeds = {
		post: function(pubObject){
			/*
			 * Channels: 
			 * =========
			 * 
			 * VILLO/FEEDS/PUBLIC
			 * VILLO/FEEDS/USERS/USERNAME
			 * VILLO/FEEDS/APPS/APPID
			 */
			/*
			 * Actions:
			 * ========
			 * 
			 * Actions aim to give developers an idea of what the feed post is about. 
			 * Developers can define any action to differentiate posts from their own app, and handle the actions accordingly.
			 * The default action is "user-post".
			 * The following are reserved actions, and any post that attempts to use them will get prefixed with "custom-".
			 * 
			 * 	- "leaders-submit",
			 *	- "friend-add",
			 *	- "profile-edit",
			 *	- "app-launch",
			 *	- "user-register",
			 *	- "user-login"
			 * 
			 * Additionally, the "villo-" prefix is reserved, and any post that attempts to use it will get prefixed with "custom-".
			 * 
			 * All actions will be converted to lowercase.
			 */
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
})();

/* Villo Friends */
(function(){
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
					
					if (!transport == "") {
						var tmprsp = JSON.parse(transport);
						if (tmprsp.friends) {
							addObject.callback(tmprsp);
						} else 
							if (transport == 33 || transport == 66 || transport == 99) {
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
					if (!transport == "") {
						var tmprsp = JSON.parse(transport);
						if (tmprsp.friends) {
							removeObject.callback(tmprsp);
						} else 
							if (transport == 33 || transport == 66 || transport == 99) {
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
		 * Get the currently logged in user's friend list.
		 * @param {object} getObject Options for the function.
		 * @param {function} getObject.callback Funtion to call once the profile is retrieved.
		 * @since 0.8.0
		 */
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
					
					villo.verbose && villo.log(transport)
					
					if (!transport == "") {
						var tmprsp = JSON.parse(transport);
						if (tmprsp.friends) {
							getObject.callback(tmprsp);
						} else 
							if (transport == 33 || transport == 66 || transport == 99) {
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
	}
})();


/* Villo Gift */
(function(){

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
						var tmprsp = JSON.parse(transport)
						if (tmprsp.gifts) {
							giftObject.callback(tmprsp);
						} else {
							if (transport == 33 || transport == 66 || transport == 99) {
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
						var tmprsp = JSON.parse(transport)
						if (tmprsp.gifts) {
							giftObject.callback(tmprsp);
						} else {
							if (transport == 33 || transport == 66 || transport == 99) {
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
						var tmprsp = JSON.parse(transport)
						if (tmprsp.gifts) {
							giftObject.callback(tmprsp);
						}
						if (transport == 33 || transport == 66 || transport == 99) {
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
						var tmprsp = JSON.parse(transport)
						if (tmprsp.gifts) {
							villo.credits = tmprsp.gifts.data;
							giftObject.callback(tmprsp);
						}
						if (transport == 33 || transport == 66 || transport == 99) {
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
						var tmprsp = JSON.parse(transport)
						if (tmprsp.gifts) {
							villo.credits = tmprsp.gifts.data;
							giftObject.callback(tmprsp);
						}
						if (transport == 33 || transport == 66 || transport == 99) {
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
	}
})();

/* Villo Init/Load */

(function(){
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
		
		//Optional utility function to swap to cookie storage if localstorage isn't supported.
		if (options.useCookies && options.useCookies === true) {
			villo.overrideStorage(true);
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
	//Override default storage options with a cookie option.
	//* @protected
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
	 * When extensions are loaded, they will run this init function by defualt, unless they package their own.
	 */
	villo.init = function(options){
		return true;
	}
})();

/* Villo Leaders */
(function(){
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
			if (getObject.board && getObject.board !== "") {
				var leaderBoardName = getObject.board;
			} else {
				var leaderBoardName = villo.app.title;
			}
			
			if(getObject.limit && getObject.limit !== "" && typeof(getObject.limit) == "number"){
				var leaderLimiter = getObject.limit;
			}else{
				var leaderLimiter = 30;
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
						var tmprsp = JSON.parse(transport)
						if (tmprsp.leaders) {
							getObject.callback(tmprsp);
						} else 
							if (transport == 33 || transport == 66 || transport == 99) {
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
			if (getObject.board && getObject.board !== "") {
				var leaderBoardName = getObject.board;
			} else {
				var leaderBoardName = villo.app.title;
			}
			
			if(getObject.limit && getObject.limit !== "" && typeof(getObject.limit) == "number"){
				var leaderLimiter = getObject.limit;
			}else{
				var leaderLimiter = 30;
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
						var tmprsp = JSON.parse(transport)
						if (tmprsp.leaders) {
							getObject.callback(tmprsp);
						} else 
							if (transport == 33 || transport == 66 || transport == 99) {
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
//TODO: Figure out callback
		submit: function(scoreObject){
		
			if (scoreObject.board && scoreObject.board !== "") {
				var leaderBoardName = scoreObject.board;
			} else {
				var leaderBoardName = villo.app.title;
			}
			if (villo.user.username == "" || !villo.user.username || (scoreObject.anon && scoreObject.anon == true)) {
				var leaderBoardUsername = "Guest"
			} else {
				var leaderBoardUsername = villo.user.username;
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
						} else if (transport == 33 || transport == 66 || transport == 99) {
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
	}
})();
/* Villo Messages */
(function(){
	//TODO
	villo.messages = {}
})();

/* Villo Profile */
(function(){
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
					if (!transport == "") {
						var tmprsp = JSON.parse(transport);
						if (tmprsp.profile) {
							getObject.callback(tmprsp);
						} else 
							if (transport == 33 || transport == 66 || transport == 99) {
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
					if (!transport == "") {
						var tmprsp = JSON.parse(transport);
						if (tmprsp.profile) {
							updateObject.callback(tmprsp);
						} else 
							if (transport == 33 || transport == 66 || transport == 99) {
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
					type: "friends",
				},
				onSuccess: function(transport){
					////Stop at logging:
					if (!transport == "") {
						var tmprsp = JSON.parse(transport);
						if (tmprsp.friends) {
							updateObject.callback(tmprsp);
						} else 
							if (transport == 33 || transport == 66 || transport == 99) {
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
	}
})();
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
(function(){
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
			if (loadObject.instant && loadObject.instant == true) {
				if(store.get(villo.app.propBag.settings)){
					villo.app.settings = store.get(villo.app.propBag.settings).settings;
					//TODO: Callback, baby
					return villo.app.settings;
				}else{
					return false;
				}
			} else {
				var theTimestamp = store.get(villo.app.propBag.settings).timestamp;
				villo.storage.get({
					privacy: true,
					title: "VilloSettingsProp",
					callback: function(transit){
						//TODO: Check for the need of this: 
						transit = JSON.parse(JSON.parse(transit));
						if (!transit.storage) {
							//Offline: 
							villo.app.settings = store.get(villo.app.propBag.settings).settings
							loadObject.callback(villo.app.settings);
						} else {
							//Check for timestamps.
							if (transit.storage.timestamp > theTimestamp) {
								//Server version is newer. Replace our existing local storage with the server storage.
								store.set(villo.app.propBag.settings, transit.storage);
								villo.app.settings = transit.storage.settings
								loadObject.callback(villo.app.settings);
							} else {
								//Local version is newer. 
								//TODO: Update server.
								villo.app.settings = store.get(villo.app.propBag.settings).settings
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
			store.set(villo.app.propBag.settings, settingsObject);
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
			store.remove(villo.app.propBag.settings);
			villo.app.settings = {};
			return true;
		}
	}
})();
/* 
 * Villo App States
 * ==========
 * Copyright 2011 Jordan Gensler. All rights reserved.
 */
(function(){
	villo.states = {
		set: function(setObject, callbackFunc){
			store.set(villo.app.propBag.states, setObject);
			villo.storage.set({
				privacy: true,
				title: "VAppState",
				data: setObject,
				callback: function(transit){
					//callbackFunc(transit);
				}
			});
		},
		get: function(getObject){
			if (getObject.instant && getObject.instant == true) {
				//Don't force return, allow callback:
				if(getObject.callback){
					getObject.callback(store.get(villo.app.propBag.states));
				}
				return store.get(villo.app.propBag.states);
			} else {
				villo.storage.get({
					privacy: true,
					title: "VAppState",
					callback: function(transit){
						//TODO: Check for the need of this:
						var transit = JSON.parse(transit);
						transit.storage = JSON.parse(villo.stripslashes(transit.storage));
						
						villo.log(transit);
						if (!transit.storage) {
							getObject.callback(store.get(villo.app.propBag.states));
						} else {
							getObject.callback(transit.storage);
						}
					}
				});
			}
		},
	}
})();
/* Villo Cloud Storage */
(function(){
	villo.storage = {
		
		//TODO: Check to see if the string is JSON when we get it back.
		//TODO: Get callback values.
		
		/**
		 * Store a piece of data on the cloud.
		 * @param {object} addObject Object containing the options.
		 * @param {boolean} addObject.privacy Can either be set to true or false. If you set it to true, the data will only be able to be accessed in the app that you set it in, and will be encrypted on the database using AES-256 encryption.
		 * @param {string} addObject.title The title of the data that you want to store.
		 * @param {string} addObject.data The data that you want to store on the database. You can also pass an object and we will stringify it for you.
		 * @param {string} addObject.callback Function to be called when the data is set on the server.
		 * @since 0.8.5
		 */
		set: function(addObject){
			//The managing of update vs new content is handled on the server
			if (!addObject.privacy) {
				addObject.privacy = false;
			}
			if (typeof(addObject.data) == "object") {
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
					if (!transport == "") {
						//Check for JSON:
						try{
							var trans = JSON.parse(transport);
						}catch(e){
							var trans = transport;
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
		/**
		 * Get a piece of data that is stored on the cloud.
		 * @param {object} getObject Object containing the options.
		 * @param {boolean} getObject.privacy If the data on the server is set to "private" you need to set this to true in order to access and decrypt it.
		 * @param {string} getObject.title The title of the data that you want to store.
		 * @param {string} getObject.data The data that you want to store on the database. You can also pass an object and we will stringify it for you.
		 * @param {string} getObject.callback Function to be called when the data is set on the server.
		 * @param {object} getObject.external If you are accessing an external app's public data, include this object..
		 * @param {string} getObject.external.appTitle The title of the external app you are recieving data from.
		 * @param {string} getObject.external.appID The appID of the external app you are recieving data from.
		 * @since 0.8.5
		 */
		get: function(getObject){
			if (!getObject.privacy) {
				getObject.privacy = false;
			}
			if (getObject.external) {
				var storeGetTitle = getObject.external.appTitle;
				var storeGetAppID = getObject.external.appID;
			} else {
				var storeGetTitle = villo.app.title;
				var storeGetAppID = villo.app.id;
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
					if (!transport == "") {
						//Check for JSON
						try{
							var trans = JSON.parse(transport);
						}catch(e){
							var trans = transport;
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
	}
})();

/* Villo User */
(function(){
	villo.user = {
		/*
		 * 
		 */
		propBag: {
			"user": null,
			"token": null
		},
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
					if (token == 1 || token == 2 || token == 33 || token == 99) {
						//Error, call back with our error codes.
						//We also are using the newer callback syntax here.
						if (callback) {
							callback(token);
						} else {
							userObject.callback(token);
						}
					} else 
						if (token.length == 32) {
							
							villo.user.strapLogin({username: userObject.username, token: token});
							
							if (callback) {
								callback(true);
							} else {
								userObject.callback(true);
							}
							
							villo.sync();
							
							//Call the hook, retroactive account.
							villo.hooks.call({name: "login"});
						} else {
							callback(33);
							villo.verbose && villo.log(33);
							villo.verbose && villo.log("Error Logging In - Undefined: " + token);
						}
				},
				onFailure: function(failure){
					callback(33);
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

*/
		logout: function(){
			//destroy user tokens and logout.
			store.remove(villo.user.propBag.user);
			store.remove(villo.user.propBag.token);
			//Remove the variables we're working with locally.
			villo.user.username = null;
			villo.user.token = null;
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
					if (token == 1 || token == 2 || token == 33 || token == 99) {
						//Error, call back with our error codes.
						if (callback) {
							callback(token);
						} else {
							userObject.callback(token);
						}
					} else 
						if (token.length == 32) {
							
							villo.user.strapLogin({username: userObject.username, token: token});
							
							if (callback) {
								callback(true);
							} else {
								userObject.callback(true);
							}
							villo.sync();
							
							//Call the hook
							villo.hooks.call({name: "register"});
						} else {
							if (callback) {
								callback(33);
							} else {
								userObject.callback(33);
							}
							villo.verbose && villo.log(33);
							villo.verbose && villo.log("Error Logging In - Undefined: " + token);
						}
				},
				onFailure: function(failure){
					if (callback) {
						callback(33);
					} else {
						userObject.callback(33);
					}
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
			store.set(villo.user.propBag.user, strapObject.username);
			store.set(villo.user.propBag.token, strapObject.token);
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
	}
})();

/* Villo Ajax */
(function(){
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
				sendingVars +=  escape(x) + "=" + escape(modifiers.parameters[x]) + "&";
			}
		}
		
		//Differentiate between POST and GET, and send the request.
		if (modifiers.method.toLowerCase() === "post") {
			var method = "POST";
		} else {
			var method = "GET"
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
			jsonp: modifiers.jsonp || false
		});	
	}
	
	/*
	 * Utility function that is utilized if no suitable ajax is available. 
	 * This should not be called directly.
	 */
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
		    if (typeof data == "string") {
		        try {validJSON = JSON.parse(data);} catch (e) {
		            /*invalid JSON*/}
		    } else {
		        validJSON = JSON.parse(JSON.stringify(data));
	                window.console && console.warn(
		            'response data was not a JSON string');
	            }
	            if (validJSON) {
	                callback(validJSON);
	            } else {
	                throw("JSONP call returned invalid or empty JSON");
	            }
	        }
	    }
	}
	
	//This function does the actual Ajax request.
	villo._do_ajax = function(options){
		//Internet Explorer checker:
		var is_iexplorer = function() {
	        return navigator.userAgent.indexOf('MSIE') != -1
	    }
	    
        var url = options['url'];
        var type = options['type'] || 'GET';
        var success = options['success'];
        var error = options['error'];
        var data = options['data'];
        
        var jsonp = options['jsonp'] || false;

        try {
            var xhr = new XMLHttpRequest();
            
            //Force JSONP:
            if (xhr && "withCredentials" in xhr && jsonp === true) {
            	delete xhr.withCredentials;
        	}
        	
        } catch (e) {}

        if (xhr && "withCredentials" in xhr) {
            xhr.open(type, url, true);
        }else{
        	//JSONP
        	/*
        	 * This method should be used for everything that doesn't support good AJAX. 
        	 * 
        	 * Use YQL + GET method
        	 * return in this method too, so that it doesn't try to process it as regular AJAX
        	 */
        	villo.jsonp.fetch('http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + url + "?" + data + '"') + '&format=json&callback=JSONPCallback', function(transit){
        		
    			//Add debugging info:
    			try{transit.query.url = url; transit.query.data = data;}catch(e){};
        		
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
                    // stupid IExplorer!!!
                    var XHRobj = is_iexplorer() ? xhr : XHRobj;

                    if (event_type == 'load' && (is_iexplorer() || XHRobj.readyState == 4) && success) success(XHRobj.responseText, XHRobj);
                    else if (error) error(XHRobj);
                }
            };

            xhr.onload = function (e) {
                handle_load('load')(is_iexplorer() ? e : e.target)
            };
            xhr.onerror = function (e) {
                handle_load('error')(is_iexplorer() ? e : e.target)
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
	}
})();

/* Villo App */
(function(){
	/*
	 * Generic/Private Functions/Housings
	 */
	villo.app = {
		propBag: {
			"states": null,
			"settings": null
		},
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
	}
})();

/* Villo Do Functions */
(function(){
	
	villo.doNothing = function(){
		//We successfully did nothing! Yay!
		return true;
	};
	
	villo.doSomething = function(){
		var strings = [];
		
		for (var i = 0; i < arguments.length; i++) {
			if (typeof(arguments[i] == "object")) {
				strings.push(JSON.stringify(arguments[i]));
			} else {
				strings.push(arguments[i]);
			}
		}
		
		villo.log("You said", strings);
		if (arguments[0] == "easterEgg") {
			//Easter Egg!
			villo.webLog("Suit up!");
		}
		return true;
	}
})();

/* Villo E & Script */
(function(){
	villo.script = {
		get: function(){
			var scripts = document.getElementsByTagName("script");
			for (var i = 0, s, src, l = "villo.js".length; s = scripts[i]; i++) {
				src = s.getAttribute("src") || "";
				if (src.slice(-l) == "villo.js") {
					return src.slice(0, -l - 1) + "/";
				}
			}
		},
		add: function(o){
			var s = document.createElement("script");
	        s.type = "text/javascript";
	        
	        //Goes nuts on the cache:
	        //s.async = true;
	    
	        s.src = o;
	        document.getElementsByTagName('head')[0].appendChild(s);
		}
	};
	villo.style = {
		add: function(o){
			var s = document.createElement("link");
	        s.type = "text/css";
	        s.rel = "stylesheet";
	        s.href = o;
	        document.getElementsByTagName('head')[0].appendChild(s);
		}
	}
})();

/* Villo Extend */
(function(){
	//Undocumented Utility Function:
	villo.mixin = function(destination, source){
		for (var k in source) {
			if (source.hasOwnProperty(k)) {
				destination[k] = source[k];
			}
		}
		return destination;
	}
/**
	villo.extend
	=================
	
	Allows developers to extend Villo functionality by adding methods to the Villo object. As of Villo 1.0, villo.extend actually adds the extend function to the Object prototype.
    
	Calling
	-------

	`villo.extend(object)`
	
	- The only parameter that villo.extend takes is the object. Villo will add the object into the main Villo object. Additionally, if you define a function named "init" in the object, the function will run when the extension is loaded.
	
	Returns
	-------
	
	The function returns the Villo object, or the part of the object you were modifying.
		
	Use
	---
		
		villo.extend({
			suggest:{
				get: function(){
					//Function that can be called using villo.
					this.users = ["kesne", "admin"];
					return this.users;
				}
			},
			init: function(){
				//This will be executed when the extension is loaded.
				villo.log("Init functionw was called.");
			}
		});
		
	Notes
	-----
	
	Because this function is actually an addition to the Object prototype, you can call it on any part of Villo that is an object.

	For example, to extend the villo.profile, object, you call `villo.profile.extend({"suggest": function(){}});`, which would add the suggest method to villo.profile.
	
	Any methods added through villo.extend will override other methods if they already exist.
	
	If you define an init function in the object, then it will be run when the extension is loaded. The init function will be deleted after it is run.

*/
	Object.defineProperty(Object.prototype, "extend", {
		value: function(obj){
			villo.verbose && console.log("Extending Villo:", this);
			villo.mixin(this, obj);
			if (typeof(this.init) == "function") {
				this.init();
				if(this._ext && this._ext.keepit && this._ext.keepit === true){
					//Do nothing
				}else{
					delete this.init;
				}
			}
			return this;
		},
		writable: true,
		configurable: true,
		enumerable: false
	});
})();(function(){
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
					setObject.callback(this.called[setObject.name].arguments);
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
				this.called[callObject.name] = {name: callObject.name, arguments: callObject.arguments || true};
			}
			//Loop through hooks, trigger ones with the same name:
			for(var x in this.hooks){
				if(this.hooks.hasOwnProperty(x)){
					if(this.hooks[x].name === callObject.name){
						//Same name, trigger it!
						this.hooks[x].callback(callObject.arguments || true);
					}
				}
			}
		},
	}
})();

/* Villo Log */
(function(){
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
			if (typeof(arguments[i] == "object")) {
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
	}
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
			if (typeof(arguments[i] == "object")) {
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
		
		if (villo.user.username && villo.user.username !== '') {
			var logName = villo.user.username;
		} else {
			var logName = "Guest";
		}
		
		theLog = strings.join(" ")
		
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
	}
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
	}
})();


/* Villo Slash Control */
(function(){
	//Adds slashes into any string to prevent it from breaking the JS.
	villo.addSlashes = function(string){
		string = string.replace(/\\/g, '\\\\');
		string = string.replace(/\'/g, '\\\'');
		string = string.replace(/\"/g, '\\"');
		string = string.replace(/\0/g, '\\0');
		return string;
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
})();

/* Villo Sync */
(function(){
	//Private function that is run on initialization.
	villo.sync = function(){
		
		/*
		 * Redeem our voucher.
		 */
		//Create voucher date
		var d = new Date();
		var voucherday = d.getDate() + " " + d.getMonth() + " " + d.getFullYear();
		//Get last voucher date
		if (store.get('voucher')) {
			if (voucherday == store.get('voucher')) {
				villo.syncFeed();
			} else {
				//Today is a new day, let's request ours and set the new date.
				store.set('voucher', voucherday);
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
			store.set('voucher', voucherday);
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
	
	}
	villo.syncFeed = function(){
		var currentTime = new Date().getTime();
		if (store.get("feed")) {
			if (currentTime > (store.get("feed") + 1000000)) {
				store.set('feed', currentTime);
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
			store.set('feed', currentTime);
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
	}
})();

/* Villo Dependencies */

/* 
 * Store.js
 * Copyright (c) 2010-2011 Marcus Westin
 */
var store=function(){var b={},e=window,g=e.document,c;b.disabled=false;b.set=function(){};b.get=function(){};b.remove=function(){};b.clear=function(){};b.transact=function(a,d){var f=b.get(a);if(typeof f=="undefined")f={};d(f);b.set(a,f)};b.serialize=function(a){return JSON.stringify(a)};b.deserialize=function(a){if(typeof a=="string")return JSON.parse(a)};var h;try{h="localStorage"in e&&e.localStorage}catch(k){h=false}if(h){c=e.localStorage;b.set=function(a,d){c.setItem(a,b.serialize(d))};b.get=
function(a){return b.deserialize(c.getItem(a))};b.remove=function(a){c.removeItem(a)};b.clear=function(){c.clear()}}else{var i;try{i="globalStorage"in e&&e.globalStorage&&e.globalStorage[e.location.hostname]}catch(l){i=false}if(i){c=e.globalStorage[e.location.hostname];b.set=function(a,d){c[a]=b.serialize(d)};b.get=function(a){return b.deserialize(c[a]&&c[a].value)};b.remove=function(a){delete c[a]};b.clear=function(){for(var a in c)delete c[a]}}else if(g.documentElement.addBehavior){c=g.createElement("div");
e=function(a){return function(){var d=Array.prototype.slice.call(arguments,0);d.unshift(c);g.body.appendChild(c);c.addBehavior("#default#userData");c.load("localStorage");d=a.apply(b,d);g.body.removeChild(c);return d}};b.set=e(function(a,d,f){a.setAttribute(d,b.serialize(f));a.save("localStorage")});b.get=e(function(a,d){return b.deserialize(a.getAttribute(d))});b.remove=e(function(a,d){a.removeAttribute(d);a.save("localStorage")});b.clear=e(function(a){var d=a.XMLDocument.documentElement.attributes;
a.load("localStorage");for(var f=0,j;j=d[f];f++)a.removeAttribute(j.name);a.save("localStorage")})}}try{b.set("__storejs__","__storejs__");if(b.get("__storejs__")!="__storejs__")b.disabled=true;b.remove("__storejs__")}catch(m){b.disabled=true}return b}();



/*
    http://www.JSON.org/json2.js
    2011-10-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html
*/

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
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
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
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


                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }


            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {


                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }


            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }


    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

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


    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {


            var j;

            function walk(holder, key) {


                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }


            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {


                j = eval('(' + text + ')');


                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

            throw new SyntaxError('JSON.parse');
        };
    }
}());


/* 
 * Script.js
 * See https://github.com/ded/script.js
 */

!function(win, doc, timeout) {
  var head = doc.getElementsByTagName('head')[0],
      list = {}, ids = {}, delay = {}, scriptpath,
      scripts = {}, s = 'string', f = false,
      push = 'push', domContentLoaded = 'DOMContentLoaded', readyState = 'readyState',
      addEventListener = 'addEventListener', onreadystatechange = 'onreadystatechange',
      every = function(ar, fn) {
        for (var i = 0, j = ar.length; i < j; ++i) {
          if (!fn(ar[i])) {
            return f;
          }
        }
        return 1;
      };
      function each(ar, fn) {
        every(ar, function(el) {
          return !fn(el);
        });
      }

  if (!doc[readyState] && doc[addEventListener]) {
    doc[addEventListener](domContentLoaded, function fn() {
      doc.removeEventListener(domContentLoaded, fn, f);
      doc[readyState] = "complete";
    }, f);
    doc[readyState] = "loading";
  }

  function $script(paths, idOrDone, optDone) {
    paths = paths[push] ? paths : [paths];
    var idOrDoneIsDone = idOrDone && idOrDone.call,
        done = idOrDoneIsDone ? idOrDone : optDone,
        id = idOrDoneIsDone ? paths.join('') : idOrDone,
        queue = paths.length;
    function loopFn(item) {
      return item.call ? item() : list[item];
    }
    function callback() {
      if (!--queue) {
        list[id] = 1;
        done && done();
        for (var dset in delay) {
          every(dset.split('|'), loopFn) && !each(delay[dset], loopFn) && (delay[dset] = []);
        }
      }
    }
    timeout(function() {
      each(paths, function(path) {
        if (scripts[path]) {
          id && (ids[id] = 1);
          scripts[path] == 2 && callback();
          return;
        }
        scripts[path] = 1;
        id && (ids[id] = 1);
        create(scriptpath ?
          scriptpath + path + '.js' :
          path, callback);
      });
    }, 0);
    return $script;
  }

  function create(path, fn) {
    var el = doc.createElement("script"),
        loaded = f;
    el.onload = el.onerror = el[onreadystatechange] = function () {
      if ((el[readyState] && !(/^c|loade/.test(el[readyState]))) || loaded) {
        return;
      }
      el.onload = el[onreadystatechange] = null;
      loaded = 1;
      scripts[path] = 2;
      fn();
    };
    el.async = 1;
    el.src = path;
	el.type = "text/javascript"
    head.insertBefore(el, head.firstChild);
  }

  $script.get = create;

  $script.path = function(p) {
    scriptpath = p
  }
  $script.ready = function(deps, ready, req) {
    deps = deps[push] ? deps : [deps];
    var missing = [];
    !each(deps, function(dep) {
      list[dep] || missing[push](dep);
    }) && every(deps, function(dep) {
      return list[dep];
    }) ? ready() : !function(key) {
      delay[key] = delay[key] || [];
      delay[key][push](ready);
      req && req(missing);
    }(deps.join('|'));
    return $script;
  };

  var old = win.$script;
  $script.noConflict = function () {
    win.$script = old;
    return this;
  };

  (typeof module !== 'undefined' && module.exports) ?
    (module.exports = $script) :
    (win['$script'] = $script);

}(this, document, setTimeout);

/* 
 * PubNub-3.1.js + socketIO
 * See http://www.pubnub.com and http://www.socket.io
 */

(function(){
function r(){return function(){}}
window.JSON&&window.JSON.stringify||function(){function w(c){k.lastIndex=0;return k.test(c)?'"'+c.replace(k,function(c){var e=g[c];return"string"===typeof e?e:"\\u"+("0000"+c.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+c+'"'}function t(c,g){var e,h,o,n,k=i,l,f=g[c];f&&"object"===typeof f&&"function"===typeof f.toJSON&&(f=f.toJSON(c));"function"===typeof m&&(f=m.call(g,c,f));switch(typeof f){case "string":return w(f);case "number":return isFinite(f)?""+f:"null";case "boolean":case "null":return""+
f;case "object":if(!f)return"null";i+=p;l=[];if("[object Array]"===Object.prototype.toString.apply(f)){n=f.length;for(e=0;e<n;e+=1)l[e]=t(e,f)||"null";o=0===l.length?"[]":i?"[\n"+i+l.join(",\n"+i)+"\n"+k+"]":"["+l.join(",")+"]";i=k;return o}if(m&&"object"===typeof m){n=m.length;for(e=0;e<n;e+=1)h=m[e],"string"===typeof h&&(o=t(h,f))&&l.push(w(h)+(i?": ":":")+o)}else for(h in f)Object.hasOwnProperty.call(f,h)&&(o=t(h,f))&&l.push(w(h)+(i?": ":":")+o);o=0===l.length?"{}":i?"{\n"+i+l.join(",\n"+i)+"\n"+
k+"}":"{"+l.join(",")+"}";i=k;return o}}window.JSON||(window.JSON={});"function"!==typeof String.prototype.toJSON&&(String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()});var k=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,i,p,g={"\u0008":"\\b","\t":"\\t","\n":"\\n","\u000c":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},m;"function"!==typeof JSON.stringify&&(JSON.stringify=function(c,
g,e){var h;p=i="";if("number"===typeof e)for(h=0;h<e;h+=1)p+=" ";else"string"===typeof e&&(p=e);if((m=g)&&"function"!==typeof g&&("object"!==typeof g||"number"!==typeof g.length))throw Error("JSON.stringify");return t("",{"":c})});"function"!==typeof JSON.parse&&(JSON.parse=function(c){return eval("("+c+")")})}();
window.PUBNUB||function(){function w(a){var b={},d=a.publish_key||"pub-42c6b905-6d4e-4896-b74f-c1065ab0dc10",s=a.subscribe_key||"sub-4e37d063-edfa-11df-8f1a-517217f921a4",j=a.ssl?"s":"",z="http"+j+"://"+(a.origin||"pubsub.pubnub.com"),q={history:function(a,b){var b=a.callback||b,d=a.limit||100,c=a.channel,e=f();if(!c)return g("Missing Channel");if(!b)return g("Missing Callback");u({c:e,url:[z,"history",s,A(c),e,d],b:function(a){b(a)},a:function(a){g(a)}})},time:function(a){var b=f();u({c:b,url:[z,"time",b],b:function(b){a(b[0])},a:function(){a(0)}})},uuid:function(a){var b=f();
u({c:b,url:["http"+j+"://pubnub-prod.appspot.com/uuid?callback="+b],b:function(b){a(b[0])},a:function(){a(0)}})},publish:function(a,b){var b=b||a.callback||r(),c=a.message,e=a.channel,j=f();if(!c)return g("Missing Message");if(!e)return g("Missing Channel");if(!d)return g("Missing Publish Key");c=JSON.stringify(c);c=[z,"publish",d,s,0,A(e),j,A(c)];if(1800<c.join().length)return g("Message Too Big");u({c:j,b:function(a){b(a)},a:function(){b([0,"Disconnected"])},url:c})},unsubscribe:function(a){a=a.channel;
a in b&&(b[a].d=0,b[a].e&&b[a].e(0))},subscribe:function(a,d){function e(){var a=f();b[j].d&&(b[j].e=u({c:a,url:[t,"subscribe",s,A(j),a,i],a:function(){m||(m=1,o());setTimeout(e,x);q.time(function(a){a||k()})},b:function(a){b[j].d&&(p||(p=1,l()),m&&(m=0,n()),h=B.set(s+j,i=h&&B.get(s+j)||a[1]),c(a[0],function(b){d(b,a)}),setTimeout(e,10))}}))}var j=a.channel,d=d||a.callback,h=a.restore,i=0,k=a.error||r(),l=a.connect||r(),n=a.reconnect||r(),o=a.disconnect||r(),m=0,p=0,t=M(z);if(!C)return I.push([a,
d,q]);if(!j)return g("Missing Channel");if(!d)return g("Missing Callback");if(!s)return g("Missing Subscribe Key");j in b||(b[j]={});if(b[j].d)return g("Already Connected");b[j].d=1;e()},xdr:u,ready:D,db:B,each:c,map:G,css:H,$:p,create:l,bind:h,supplant:e,head:o,search:m,attr:n,now:k,unique:t,events:y,updater:i,init:w};return q}function t(){return"x"+ ++N+""+ +new Date}function k(){return+new Date}function i(a,b){function d(){c+b>k()?(clearTimeout(s),s=setTimeout(d,b)):(c=k(),a())}var s,c=0;return d}
function p(a){return document.getElementById(a)}function g(a){console.log(a)}function m(a,b){var d=[];c(a.split(/\s+/),function(a){c((b||document).getElementsByTagName(a),function(a){d.push(a)})});return d}function c(a,b){if(a&&b)if("undefined"!=typeof a[0])for(var d=0,s=a.length;d<s;)b.call(a[d],a[d],d++);else for(d in a)a.hasOwnProperty&&a.hasOwnProperty(d)&&b.call(a[d],d,a[d])}function G(a,b){var d=[];c(a||[],function(a,c){d.push(b(a,c))});return d}function e(a,b){return a.replace(O,function(a,
c){return b[c]||a})}function h(a,b,d){c(a.split(","),function(a){function c(a){a||(a=window.event);d(a)||(a.cancelBubble=!0,a.returnValue=!1,a.preventDefault&&a.preventDefault(),a.stopPropagation&&a.stopPropagation())}b.addEventListener?b.addEventListener(a,c,!1):b.attachEvent?b.attachEvent("on"+a,c):b["on"+a]=c})}function o(){return m("head")[0]}function n(a,b,d){if(d)a.setAttribute(b,d);else return a&&a.getAttribute&&a.getAttribute(b)}function H(a,b){for(var d in b)if(b.hasOwnProperty(d))try{a.style[d]=
b[d]+(0<"|width|height|top|left|".indexOf(d)&&"number"==typeof b[d]?"px":"")}catch(c){}}function l(a){return document.createElement(a)}function f(){return E||q()?0:t()}function A(a){return G(encodeURIComponent(a).split(""),function(a){return 0>"-_.!~*'()".indexOf(a)?a:"%"+a.charCodeAt(0).toString(16).toUpperCase()}).join("")}function u(a){function b(a,b){f||(f=1,a||i(b),d.onerror=null,clearTimeout(g),setTimeout(function(){a&&h();var b=p(e),d=b&&b.parentNode;d&&d.removeChild(b)},x))}if(E||q())return P(a);
var d=l("script"),c=a.c,e=t(),f=0,g=setTimeout(function(){b(1)},F),h=a.a||r(),i=a.b||r();window[c]=function(a){b(0,a)};d[J]=J;d.onerror=function(){b(1)};d.src=a.url.join(K);n(d,"id",e);o().appendChild(d);return b}function P(a){function b(a){e||(e=1,clearTimeout(g),c&&(c.onerror=c.onload=null,c.abort&&c.abort(),c=null),a&&h())}function d(){if(!f){f=1;clearTimeout(g);try{response=JSON.parse(c.responseText)}catch(a){return b(1)}i(response)}}var c,e=0,f=0,g=setTimeout(function(){b(1)},F),h=a.a||r(),i=
a.b||r();try{c=q()||window.XDomainRequest&&new XDomainRequest||new XMLHttpRequest,c.onerror=c.onabort=function(){b(1)},c.onload=c.onloadend=d,c.timeout=F,c.open("GET",a.url.join(K),!0),c.send()}catch(k){return b(0),E=0,u(a)}return b}function D(){PUBNUB.time(k);PUBNUB.time(function(){setTimeout(function(){C||(C=1,c(I,function(a){a[2].subscribe(a[0],a[1])}))},x)})}function q(){if(!L.get)return 0;var a={id:q.id++,send:r(),abort:function(){a.id={}},open:function(b,c){q[a.id]=a;L.get(a.id,c)}};return a}
window.console||(window.console=window.console||{});console.log||(console.log=(window.opera||{}).postError||r());var B=function(){var a=window.localStorage;return{get:function(b){try{return a?a.getItem(b):-1==document.cookie.indexOf(b)?null:((document.cookie||"").match(RegExp(b+"=([^;]+)"))||[])[1]||null}catch(c){}},set:function(b,c){try{if(a)return a.setItem(b,c)&&0;document.cookie=b+"="+c+"; expires=Thu, 1 Aug 2030 20:00:00 UTC; path=/"}catch(e){}}}}(),N=1,O=/{([\w\-]+)}/g,J="async",K="/",F=14E4,
x=1E3,E=-1==navigator.userAgent.indexOf("MSIE 6"),M=function(){var a=Math.floor(9*Math.random())+1;return function(b){return 0<b.indexOf("pubsub")&&b.replace("pubsub","ps"+(10>++a?a:a=1))||b}}(),y={list:{},unbind:function(a){y.list[a]=[]},bind:function(a,b){(y.list[a]=y.list[a]||[]).push(b)},fire:function(a,b){c(y.list[a]||[],function(a){a(b)})}},v=p("pubnub")||{},C=0,I=[];PUBNUB=w({publish_key:n(v,"pub-key"),subscribe_key:n(v,"sub-key"),ssl:"on"==n(v,"ssl"),origin:n(v,"origin")});H(v,{position:"absolute",
top:-x});if("opera"in window||n(v,"flash"))v.innerHTML="<object id=pubnubs data=https://dh15atwfs066y.cloudfront.net/pubnub.swf><param name=movie value=https://dh15atwfs066y.cloudfront.net/pubnub.swf><param name=allowscriptaccess value=always></object>";var L=p("pubnubs")||{};h("load",window,function(){setTimeout(D,0)});PUBNUB.rdx=function(a,b){if(!b)return q[a].onerror();q[a].responseText=unescape(b);q[a].onload()};q.id=x;window.jQuery&&(window.jQuery.PUBNUB=PUBNUB);"undefined"!==typeof module&&
(module.f=PUBNUB)&&D()}();
})();
(function(){
"use strict";var sjcl=window['sjcl']={cipher:{},hash:{},keyexchange:{},mode:{},misc:{},codec:{},exception:{corrupt:function(a){this.toString=function(){return"CORRUPT: "+this.message};this.message=a},invalid:function(a){this.toString=function(){return"INVALID: "+this.message};this.message=a},bug:function(a){this.toString=function(){return"BUG: "+this.message};this.message=a},notReady:function(a){this.toString=function(){return"NOT READY: "+this.message};this.message=a}}};
sjcl.cipher.aes=function(a){this.h[0][0][0]||this.w();var b,c,d,e,f=this.h[0][4],g=this.h[1];b=a.length;var h=1;if(b!==4&&b!==6&&b!==8)throw new sjcl.exception.invalid("invalid aes key size");this.a=[d=a.slice(0),e=[]];for(a=b;a<4*b+28;a++){c=d[a-1];if(a%b===0||b===8&&a%b===4){c=f[c>>>24]<<24^f[c>>16&255]<<16^f[c>>8&255]<<8^f[c&255];if(a%b===0){c=c<<8^c>>>24^h<<24;h=h<<1^(h>>7)*283}}d[a]=d[a-b]^c}for(b=0;a;b++,a--){c=d[b&3?a:a-4];e[b]=a<=4||b<4?c:g[0][f[c>>>24]]^g[1][f[c>>16&255]]^g[2][f[c>>8&255]]^
g[3][f[c&255]]}};
sjcl.cipher.aes.prototype={encrypt:function(a){return this.H(a,0)},decrypt:function(a){return this.H(a,1)},h:[[[],[],[],[],[]],[[],[],[],[],[]]],w:function(){var a=this.h[0],b=this.h[1],c=a[4],d=b[4],e,f,g,h=[],i=[],k,j,l,m;for(e=0;e<0x100;e++)i[(h[e]=e<<1^(e>>7)*283)^e]=e;for(f=g=0;!c[f];f^=k||1,g=i[g]||1){l=g^g<<1^g<<2^g<<3^g<<4;l=l>>8^l&255^99;c[f]=l;d[l]=f;j=h[e=h[k=h[f]]];m=j*0x1010101^e*0x10001^k*0x101^f*0x1010100;j=h[l]*0x101^l*0x1010100;for(e=0;e<4;e++){a[e][f]=j=j<<24^j>>>8;b[e][l]=m=m<<24^m>>>8}}for(e=
0;e<5;e++){a[e]=a[e].slice(0);b[e]=b[e].slice(0)}},H:function(a,b){if(a.length!==4)throw new sjcl.exception.invalid("invalid aes block size");var c=this.a[b],d=a[0]^c[0],e=a[b?3:1]^c[1],f=a[2]^c[2];a=a[b?1:3]^c[3];var g,h,i,k=c.length/4-2,j,l=4,m=[0,0,0,0];g=this.h[b];var n=g[0],o=g[1],p=g[2],q=g[3],r=g[4];for(j=0;j<k;j++){g=n[d>>>24]^o[e>>16&255]^p[f>>8&255]^q[a&255]^c[l];h=n[e>>>24]^o[f>>16&255]^p[a>>8&255]^q[d&255]^c[l+1];i=n[f>>>24]^o[a>>16&255]^p[d>>8&255]^q[e&255]^c[l+2];a=n[a>>>24]^o[d>>16&
255]^p[e>>8&255]^q[f&255]^c[l+3];l+=4;d=g;e=h;f=i}for(j=0;j<4;j++){m[b?3&-j:j]=r[d>>>24]<<24^r[e>>16&255]<<16^r[f>>8&255]<<8^r[a&255]^c[l++];g=d;d=e;e=f;f=a;a=g}return m}};
sjcl.bitArray={bitSlice:function(a,b,c){a=sjcl.bitArray.P(a.slice(b/32),32-(b&31)).slice(1);return c===undefined?a:sjcl.bitArray.clamp(a,c-b)},extract:function(a,b,c){var d=Math.floor(-b-c&31);return((b+c-1^b)&-32?a[b/32|0]<<32-d^a[b/32+1|0]>>>d:a[b/32|0]>>>d)&(1<<c)-1},concat:function(a,b){if(a.length===0||b.length===0)return a.concat(b);var c=a[a.length-1],d=sjcl.bitArray.getPartial(c);return d===32?a.concat(b):sjcl.bitArray.P(b,d,c|0,a.slice(0,a.length-1))},bitLength:function(a){var b=a.length;
if(b===0)return 0;return(b-1)*32+sjcl.bitArray.getPartial(a[b-1])},clamp:function(a,b){if(a.length*32<b)return a;a=a.slice(0,Math.ceil(b/32));var c=a.length;b&=31;if(c>0&&b)a[c-1]=sjcl.bitArray.partial(b,a[c-1]&2147483648>>b-1,1);return a},partial:function(a,b,c){if(a===32)return b;return(c?b|0:b<<32-a)+a*0x10000000000},getPartial:function(a){return Math.round(a/0x10000000000)||32},equal:function(a,b){if(sjcl.bitArray.bitLength(a)!==sjcl.bitArray.bitLength(b))return false;var c=0,d;for(d=0;d<a.length;d++)c|=
a[d]^b[d];return c===0},P:function(a,b,c,d){var e;e=0;if(d===undefined)d=[];for(;b>=32;b-=32){d.push(c);c=0}if(b===0)return d.concat(a);for(e=0;e<a.length;e++){d.push(c|a[e]>>>b);c=a[e]<<32-b}e=a.length?a[a.length-1]:0;a=sjcl.bitArray.getPartial(e);d.push(sjcl.bitArray.partial(b+a&31,b+a>32?c:d.pop(),1));return d},k:function(a,b){return[a[0]^b[0],a[1]^b[1],a[2]^b[2],a[3]^b[3]]}};
sjcl.codec.utf8String={fromBits:function(a){var b="",c=sjcl.bitArray.bitLength(a),d,e;for(d=0;d<c/8;d++){if((d&3)===0)e=a[d/4];b+=String.fromCharCode(e>>>24);e<<=8}return decodeURIComponent(escape(b))},toBits:function(a){a=unescape(encodeURIComponent(a));var b=[],c,d=0;for(c=0;c<a.length;c++){d=d<<8|a.charCodeAt(c);if((c&3)===3){b.push(d);d=0}}c&3&&b.push(sjcl.bitArray.partial(8*(c&3),d));return b}};
sjcl.codec.hex={fromBits:function(a){var b="",c;for(c=0;c<a.length;c++)b+=((a[c]|0)+0xf00000000000).toString(16).substr(4);return b.substr(0,sjcl.bitArray.bitLength(a)/4)},toBits:function(a){var b,c=[],d;a=a.replace(/\s|0x/g,"");d=a.length;a+="00000000";for(b=0;b<a.length;b+=8)c.push(parseInt(a.substr(b,8),16)^0);return sjcl.bitArray.clamp(c,d*4)}};
sjcl.codec.base64={D:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",fromBits:function(a,b,c){var d="",e=0,f=sjcl.codec.base64.D,g=0,h=sjcl.bitArray.bitLength(a);if(c)f=f.substr(0,62)+"-_";for(c=0;d.length*6<h;){d+=f.charAt((g^a[c]>>>e)>>>26);if(e<6){g=a[c]<<6-e;e+=26;c++}else{g<<=6;e-=6}}for(;d.length&3&&!b;)d+="=";return d},toBits:function(a,b){a=a.replace(/\s|=/g,"");var c=[],d=0,e=sjcl.codec.base64.D,f=0,g;if(b)e=e.substr(0,62)+"-_";for(b=0;b<a.length;b++){g=e.indexOf(a.charAt(b));
if(g<0)throw new sjcl.exception.invalid("this isn't base64!");if(d>26){d-=26;c.push(f^g>>>d);f=g<<32-d}else{d+=6;f^=g<<32-d}}d&56&&c.push(sjcl.bitArray.partial(d&56,f,1));return c}};sjcl.codec.base64url={fromBits:function(a){return sjcl.codec.base64.fromBits(a,1,1)},toBits:function(a){return sjcl.codec.base64.toBits(a,1)}};sjcl.hash.sha256=function(a){this.a[0]||this.w();if(a){this.n=a.n.slice(0);this.i=a.i.slice(0);this.e=a.e}else this.reset()};sjcl.hash.sha256.hash=function(a){return(new sjcl.hash.sha256).update(a).finalize()};
sjcl.hash.sha256.prototype={blockSize:512,reset:function(){this.n=this.N.slice(0);this.i=[];this.e=0;return this},update:function(a){if(typeof a==="string")a=sjcl.codec.utf8String.toBits(a);var b,c=this.i=sjcl.bitArray.concat(this.i,a);b=this.e;a=this.e=b+sjcl.bitArray.bitLength(a);for(b=512+b&-512;b<=a;b+=512)this.C(c.splice(0,16));return this},finalize:function(){var a,b=this.i,c=this.n;b=sjcl.bitArray.concat(b,[sjcl.bitArray.partial(1,1)]);for(a=b.length+2;a&15;a++)b.push(0);b.push(Math.floor(this.e/
4294967296));for(b.push(this.e|0);b.length;)this.C(b.splice(0,16));this.reset();return c},N:[],a:[],w:function(){function a(e){return(e-Math.floor(e))*0x100000000|0}var b=0,c=2,d;a:for(;b<64;c++){for(d=2;d*d<=c;d++)if(c%d===0)continue a;if(b<8)this.N[b]=a(Math.pow(c,0.5));this.a[b]=a(Math.pow(c,1/3));b++}},C:function(a){var b,c,d=a.slice(0),e=this.n,f=this.a,g=e[0],h=e[1],i=e[2],k=e[3],j=e[4],l=e[5],m=e[6],n=e[7];for(a=0;a<64;a++){if(a<16)b=d[a];else{b=d[a+1&15];c=d[a+14&15];b=d[a&15]=(b>>>7^b>>>18^
b>>>3^b<<25^b<<14)+(c>>>17^c>>>19^c>>>10^c<<15^c<<13)+d[a&15]+d[a+9&15]|0}b=b+n+(j>>>6^j>>>11^j>>>25^j<<26^j<<21^j<<7)+(m^j&(l^m))+f[a];n=m;m=l;l=j;j=k+b|0;k=i;i=h;h=g;g=b+(h&i^k&(h^i))+(h>>>2^h>>>13^h>>>22^h<<30^h<<19^h<<10)|0}e[0]=e[0]+g|0;e[1]=e[1]+h|0;e[2]=e[2]+i|0;e[3]=e[3]+k|0;e[4]=e[4]+j|0;e[5]=e[5]+l|0;e[6]=e[6]+m|0;e[7]=e[7]+n|0}};
sjcl.mode.ccm={name:"ccm",encrypt:function(a,b,c,d,e){var f,g=b.slice(0),h=sjcl.bitArray,i=h.bitLength(c)/8,k=h.bitLength(g)/8;e=e||64;d=d||[];if(i<7)throw new sjcl.exception.invalid("ccm: iv must be at least 7 bytes");for(f=2;f<4&&k>>>8*f;f++);if(f<15-i)f=15-i;c=h.clamp(c,8*(15-f));b=sjcl.mode.ccm.G(a,b,c,d,e,f);g=sjcl.mode.ccm.I(a,g,c,b,e,f);return h.concat(g.data,g.tag)},decrypt:function(a,b,c,d,e){e=e||64;d=d||[];var f=sjcl.bitArray,g=f.bitLength(c)/8,h=f.bitLength(b),i=f.clamp(b,h-e),k=f.bitSlice(b,
h-e);h=(h-e)/8;if(g<7)throw new sjcl.exception.invalid("ccm: iv must be at least 7 bytes");for(b=2;b<4&&h>>>8*b;b++);if(b<15-g)b=15-g;c=f.clamp(c,8*(15-b));i=sjcl.mode.ccm.I(a,i,c,k,e,b);a=sjcl.mode.ccm.G(a,i.data,c,d,e,b);if(!f.equal(i.tag,a))throw new sjcl.exception.corrupt("ccm: tag doesn't match");return i.data},G:function(a,b,c,d,e,f){var g=[],h=sjcl.bitArray,i=h.k;e/=8;if(e%2||e<4||e>16)throw new sjcl.exception.invalid("ccm: invalid tag length");if(d.length>0xffffffff||b.length>0xffffffff)throw new sjcl.exception.bug("ccm: can't deal with 4GiB or more data");
f=[h.partial(8,(d.length?64:0)|e-2<<2|f-1)];f=h.concat(f,c);f[3]|=h.bitLength(b)/8;f=a.encrypt(f);if(d.length){c=h.bitLength(d)/8;if(c<=65279)g=[h.partial(16,c)];else if(c<=0xffffffff)g=h.concat([h.partial(16,65534)],[c]);g=h.concat(g,d);for(d=0;d<g.length;d+=4)f=a.encrypt(i(f,g.slice(d,d+4).concat([0,0,0])))}for(d=0;d<b.length;d+=4)f=a.encrypt(i(f,b.slice(d,d+4).concat([0,0,0])));return h.clamp(f,e*8)},I:function(a,b,c,d,e,f){var g,h=sjcl.bitArray;g=h.k;var i=b.length,k=h.bitLength(b);c=h.concat([h.partial(8,
f-1)],c).concat([0,0,0]).slice(0,4);d=h.bitSlice(g(d,a.encrypt(c)),0,e);if(!i)return{tag:d,data:[]};for(g=0;g<i;g+=4){c[3]++;e=a.encrypt(c);b[g]^=e[0];b[g+1]^=e[1];b[g+2]^=e[2];b[g+3]^=e[3]}return{tag:d,data:h.clamp(b,k)}}};
sjcl.mode.ocb2={name:"ocb2",encrypt:function(a,b,c,d,e,f){if(sjcl.bitArray.bitLength(c)!==128)throw new sjcl.exception.invalid("ocb iv must be 128 bits");var g,h=sjcl.mode.ocb2.A,i=sjcl.bitArray,k=i.k,j=[0,0,0,0];c=h(a.encrypt(c));var l,m=[];d=d||[];e=e||64;for(g=0;g+4<b.length;g+=4){l=b.slice(g,g+4);j=k(j,l);m=m.concat(k(c,a.encrypt(k(c,l))));c=h(c)}l=b.slice(g);b=i.bitLength(l);g=a.encrypt(k(c,[0,0,0,b]));l=i.clamp(k(l.concat([0,0,0]),g),b);j=k(j,k(l.concat([0,0,0]),g));j=a.encrypt(k(j,k(c,h(c))));
if(d.length)j=k(j,f?d:sjcl.mode.ocb2.pmac(a,d));return m.concat(i.concat(l,i.clamp(j,e)))},decrypt:function(a,b,c,d,e,f){if(sjcl.bitArray.bitLength(c)!==128)throw new sjcl.exception.invalid("ocb iv must be 128 bits");e=e||64;var g=sjcl.mode.ocb2.A,h=sjcl.bitArray,i=h.k,k=[0,0,0,0],j=g(a.encrypt(c)),l,m,n=sjcl.bitArray.bitLength(b)-e,o=[];d=d||[];for(c=0;c+4<n/32;c+=4){l=i(j,a.decrypt(i(j,b.slice(c,c+4))));k=i(k,l);o=o.concat(l);j=g(j)}m=n-c*32;l=a.encrypt(i(j,[0,0,0,m]));l=i(l,h.clamp(b.slice(c),
m).concat([0,0,0]));k=i(k,l);k=a.encrypt(i(k,i(j,g(j))));if(d.length)k=i(k,f?d:sjcl.mode.ocb2.pmac(a,d));if(!h.equal(h.clamp(k,e),h.bitSlice(b,n)))throw new sjcl.exception.corrupt("ocb: tag doesn't match");return o.concat(h.clamp(l,m))},pmac:function(a,b){var c,d=sjcl.mode.ocb2.A,e=sjcl.bitArray,f=e.k,g=[0,0,0,0],h=a.encrypt([0,0,0,0]);h=f(h,d(d(h)));for(c=0;c+4<b.length;c+=4){h=d(h);g=f(g,a.encrypt(f(h,b.slice(c,c+4))))}b=b.slice(c);if(e.bitLength(b)<128){h=f(h,d(h));b=e.concat(b,[2147483648|0,0,
0,0])}g=f(g,b);return a.encrypt(f(d(f(h,d(h))),g))},A:function(a){return[a[0]<<1^a[1]>>>31,a[1]<<1^a[2]>>>31,a[2]<<1^a[3]>>>31,a[3]<<1^(a[0]>>>31)*135]}};sjcl.misc.hmac=function(a,b){this.M=b=b||sjcl.hash.sha256;var c=[[],[]],d=b.prototype.blockSize/32;this.l=[new b,new b];if(a.length>d)a=b.hash(a);for(b=0;b<d;b++){c[0][b]=a[b]^909522486;c[1][b]=a[b]^1549556828}this.l[0].update(c[0]);this.l[1].update(c[1])};
sjcl.misc.hmac.prototype.encrypt=sjcl.misc.hmac.prototype.mac=function(a,b){a=(new this.M(this.l[0])).update(a,b).finalize();return(new this.M(this.l[1])).update(a).finalize()};
sjcl.misc.pbkdf2=function(a,b,c,d,e){c=c||1E3;if(d<0||c<0)throw sjcl.exception.invalid("invalid params to pbkdf2");if(typeof a==="string")a=sjcl.codec.utf8String.toBits(a);e=e||sjcl.misc.hmac;a=new e(a);var f,g,h,i,k=[],j=sjcl.bitArray;for(i=1;32*k.length<(d||1);i++){e=f=a.encrypt(j.concat(b,[i]));for(g=1;g<c;g++){f=a.encrypt(f);for(h=0;h<f.length;h++)e[h]^=f[h]}k=k.concat(e)}if(d)k=j.clamp(k,d);return k};
sjcl.random={randomWords:function(a,b){var c=[];b=this.isReady(b);var d;if(b===0)throw new sjcl.exception.notReady("generator isn't seeded");else b&2&&this.U(!(b&1));for(b=0;b<a;b+=4){(b+1)%0x10000===0&&this.L();d=this.u();c.push(d[0],d[1],d[2],d[3])}this.L();return c.slice(0,a)},setDefaultParanoia:function(a){this.t=a},addEntropy:function(a,b,c){c=c||"user";var d,e,f=(new Date).valueOf(),g=this.q[c],h=this.isReady();d=this.F[c];if(d===undefined)d=this.F[c]=this.R++;if(g===undefined)g=this.q[c]=0;this.q[c]=
(this.q[c]+1)%this.b.length;switch(typeof a){case "number":break;case "object":if(b===undefined)for(c=b=0;c<a.length;c++)for(e=a[c];e>0;){b++;e>>>=1}this.b[g].update([d,this.J++,2,b,f,a.length].concat(a));break;case "string":if(b===undefined)b=a.length;this.b[g].update([d,this.J++,3,b,f,a.length]);this.b[g].update(a);break;default:throw new sjcl.exception.bug("random: addEntropy only supports number, array or string");}this.j[g]+=b;this.f+=b;if(h===0){this.isReady()!==0&&this.K("seeded",Math.max(this.g,
this.f));this.K("progress",this.getProgress())}},isReady:function(a){a=this.B[a!==undefined?a:this.t];return this.g&&this.g>=a?this.j[0]>80&&(new Date).valueOf()>this.O?3:1:this.f>=a?2:0},getProgress:function(a){a=this.B[a?a:this.t];return this.g>=a?1["0"]:this.f>a?1["0"]:this.f/a},startCollectors:function(){if(!this.m){if(window.addEventListener){window.addEventListener("load",this.o,false);window.addEventListener("mousemove",this.p,false)}else if(document.attachEvent){document.attachEvent("onload",
this.o);document.attachEvent("onmousemove",this.p)}else throw new sjcl.exception.bug("can't attach event");this.m=true}},stopCollectors:function(){if(this.m){if(window.removeEventListener){window.removeEventListener("load",this.o,false);window.removeEventListener("mousemove",this.p,false)}else if(window.detachEvent){window.detachEvent("onload",this.o);window.detachEvent("onmousemove",this.p)}this.m=false}},addEventListener:function(a,b){this.r[a][this.Q++]=b},removeEventListener:function(a,b){var c;
a=this.r[a];var d=[];for(c in a)a.hasOwnProperty(c)&&a[c]===b&&d.push(c);for(b=0;b<d.length;b++){c=d[b];delete a[c]}},b:[new sjcl.hash.sha256],j:[0],z:0,q:{},J:0,F:{},R:0,g:0,f:0,O:0,a:[0,0,0,0,0,0,0,0],d:[0,0,0,0],s:undefined,t:6,m:false,r:{progress:{},seeded:{}},Q:0,B:[0,48,64,96,128,192,0x100,384,512,768,1024],u:function(){for(var a=0;a<4;a++){this.d[a]=this.d[a]+1|0;if(this.d[a])break}return this.s.encrypt(this.d)},L:function(){this.a=this.u().concat(this.u());this.s=new sjcl.cipher.aes(this.a)},
T:function(a){this.a=sjcl.hash.sha256.hash(this.a.concat(a));this.s=new sjcl.cipher.aes(this.a);for(a=0;a<4;a++){this.d[a]=this.d[a]+1|0;if(this.d[a])break}},U:function(a){var b=[],c=0,d;this.O=b[0]=(new Date).valueOf()+3E4;for(d=0;d<16;d++)b.push(Math.random()*0x100000000|0);for(d=0;d<this.b.length;d++){b=b.concat(this.b[d].finalize());c+=this.j[d];this.j[d]=0;if(!a&&this.z&1<<d)break}if(this.z>=1<<this.b.length){this.b.push(new sjcl.hash.sha256);this.j.push(0)}this.f-=c;if(c>this.g)this.g=c;this.z++;
this.T(b)},p:function(a){sjcl.random.addEntropy([a.x||a.clientX||a.offsetX,a.y||a.clientY||a.offsetY],2,"mouse")},o:function(){sjcl.random.addEntropy(new Date,2,"loadtime")},K:function(a,b){var c;a=sjcl.random.r[a];var d=[];for(c in a)a.hasOwnProperty(c)&&d.push(a[c]);for(c=0;c<d.length;c++)d[c](b)}};try{var s=new Uint32Array(32);crypto.getRandomValues(s);sjcl.random.addEntropy(s,1024,"crypto['getRandomValues']")}catch(t){}
sjcl.json={defaults:{v:1,iter:1E3,ks:128,ts:64,mode:"ccm",adata:"",cipher:"aes"},encrypt:function(a,b,c,d){c=c||{};d=d||{};var e=sjcl.json,f=e.c({iv:sjcl.random.randomWords(4,0)},e.defaults);e.c(f,c);if(typeof f.salt==="string")f.salt=sjcl.codec.base64.toBits(f.salt);if(typeof f.iv==="string")f.iv=sjcl.codec.base64.toBits(f.iv);if(!sjcl.mode[f.mode]||!sjcl.cipher[f.cipher]||typeof a==="string"&&f.iter<=100||f.ts!==64&&f.ts!==96&&f.ts!==128||f.ks!==128&&f.ks!==192&&f.ks!==0x100||f.iv.length<2||f.iv.length>
4)throw new sjcl.exception.invalid("json encrypt: invalid parameters");if(typeof a==="string"){c=sjcl.misc.cachedPbkdf2(a,f);a=c.key.slice(0,f.ks/32);f.salt=c.salt}if(typeof b==="string")b=sjcl.codec.utf8String.toBits(b);c=new sjcl.cipher[f.cipher](a);e.c(d,f);d.key=a;f.ct=sjcl.mode[f.mode].encrypt(c,b,f.iv,f.adata,f.ts);return e.encode(e.V(f,e.defaults))},decrypt:function(a,b,c,d){c=c||{};d=d||{};var e=sjcl.json;b=e.c(e.c(e.c({},e.defaults),e.decode(b)),c,true);if(typeof b.salt==="string")b.salt=
sjcl.codec.base64.toBits(b.salt);if(typeof b.iv==="string")b.iv=sjcl.codec.base64.toBits(b.iv);if(!sjcl.mode[b.mode]||!sjcl.cipher[b.cipher]||typeof a==="string"&&b.iter<=100||b.ts!==64&&b.ts!==96&&b.ts!==128||b.ks!==128&&b.ks!==192&&b.ks!==0x100||!b.iv||b.iv.length<2||b.iv.length>4)throw new sjcl.exception.invalid("json decrypt: invalid parameters");if(typeof a==="string"){c=sjcl.misc.cachedPbkdf2(a,b);a=c.key.slice(0,b.ks/32);b.salt=c.salt}c=new sjcl.cipher[b.cipher](a);c=sjcl.mode[b.mode].decrypt(c,
b.ct,b.iv,b.adata,b.ts);e.c(d,b);d.key=a;return sjcl.codec.utf8String.fromBits(c)},encode:function(a){var b,c="{",d="";for(b in a)if(a.hasOwnProperty(b)){if(!b.match(/^[a-z0-9]+$/i))throw new sjcl.exception.invalid("json encode: invalid property name");c+=d+b+":";d=",";switch(typeof a[b]){case "number":case "boolean":c+=a[b];break;case "string":c+='"'+escape(a[b])+'"';break;case "object":c+='"'+sjcl.codec.base64.fromBits(a[b],1)+'"';break;default:throw new sjcl.exception.bug("json encode: unsupported type");
}}return c+"}"},decode:function(a){a=a.replace(/\s/g,"");if(!a.match(/^\{.*\}$/))throw new sjcl.exception.invalid("json decode: this isn't json!");a=a.replace(/^\{|\}$/g,"").split(/,/);var b={},c,d;for(c=0;c<a.length;c++){if(!(d=a[c].match(/^([a-z][a-z0-9]*):(?:(\d+)|"([a-z0-9+\/%*_.@=\-]*)")$/i)))throw new sjcl.exception.invalid("json decode: this isn't json!");b[d[1]]=d[2]?parseInt(d[2],10):d[1].match(/^(ct|salt|iv)$/)?sjcl.codec.base64.toBits(d[3]):unescape(d[3])}return b},c:function(a,b,c){if(a===
undefined)a={};if(b===undefined)return a;var d;for(d in b)if(b.hasOwnProperty(d)){if(c&&a[d]!==undefined&&a[d]!==b[d])throw new sjcl.exception.invalid("required parameter overridden");a[d]=b[d]}return a},V:function(a,b){var c={},d;for(d in a)if(a.hasOwnProperty(d)&&a[d]!==b[d])c[d]=a[d];return c},W:function(a,b){var c={},d;for(d=0;d<b.length;d++)if(a[b[d]]!==undefined)c[b[d]]=a[b[d]];return c}};sjcl.encrypt=sjcl.json.encrypt;sjcl.decrypt=sjcl.json.decrypt;sjcl.misc.S={};
sjcl.misc.cachedPbkdf2=function(a,b){var c=sjcl.misc.S,d;b=b||{};d=b.iter||1E3;c=c[a]=c[a]||{};d=c[d]=c[d]||{firstSalt:b.salt&&b.salt.length?b.salt.slice(0):sjcl.random.randomWords(2,0)};c=b.salt===undefined?d.firstSalt:b.salt;d[c]=d[c]||sjcl.misc.pbkdf2(a,c,b.iter);return{key:d[c].slice(0),salt:c.slice(0)}};
})();
(function(){function l(c){b.each(e,function(a){var d=f[a][c];d.connected&&(d.connected=!1,d.socket.user_count--,b.events.fire(a+"leave",d))})}function k(b,a){var b=b||g,d=e[b];return"password"in d&&d.password&&sjcl.encrypt(d.password,JSON.stringify(a)+"")||a}function p(b,a){var b=b||g,d=e[b];if(!d.password)return a;try{return JSON.parse(sjcl.decrypt(d.password,a))}catch(f){return null}}function h(c,a,d,e,f){b.publish({channel:b.channel,message:{name:c,ns:a||g,data:k(a,d||{}),uuid:i,geo:b.location||
[0,0]},callback:function(b){if(b[0])return(f||function(){})(b);var g=2*(e||500);setTimeout(function(){h(c,a,d,g,f)},5500<g?5500:g)}})}function m(c){c=c||function(){};navigator&&navigator.geolocation&&navigator.geolocation.getCurrentPosition(function(a){b.location=[a.coords.latitude,a.coords.longitude];c(b.location)})||c([0,0])}function n(c){c!==g&&!(g in e)&&n(g);return e[c]={namespace:c,users:f[c]={},user_count:1,get_user_list:function(){return e[c].users},get_user_count:function(){return e[c].user_count},
emit:function(b,d,e){h(b,c,d,0,e)},send:function(b,d){h("message",c,b,0,d)},on:function(a,d){"string"===typeof a?b.events.bind(c+a,d):"object"===typeof a&&b.each(a,function(a){b.events.bind(c+a,d)})},disconnect:function(){delete e[c]}}}var b=PUBNUB,g="standard",i=PUBNUB.db.get("uuid")||b.uuid(function(b){PUBNUB.db.set("uuid",i=b)}),e={},f={},o=window.io={connected:!1,connect:function(c,a){var d=(c+"////").split("/"),a=a||{},k=a.user||{},q="presence"in a?a.presence:!0,r=d[2],j=n(d[3]||g);j.password=
"sjcl"in window&&a.password;if(o.connected)return j;o.connected=!0;a.geo&&setInterval(m,15E3)&&m();a.origin=r;b=b.init(a);b.disconnected=0;b.channel=a.channel||g;b.subscribe({channel:b.channel,disconnect:function(){b.disconnected||(b.disconnected=1,b.each(e,function(a){b.events.fire(a+"disconnect",{})}))},reconnect:function(){b.disconnected=0},connect:function(){b.disconnected=0;b.each(e,function(a){b.events.fire(a+"connect",{})})},callback:function(a){b.disconnected&&b.each(e,function(a){b.events.fire(a+
"reconnect",{})});b.disconnected=0;var d=p(a.ns,a.data);a.ns in e&&d&&b.events.fire(a.ns+a.name,d);a.uuid&&a.uuid!==i&&("ping"===a.name&&b.each(d.nss,function(c){f[c]=f[c]||{};var e=f[c][a.uuid]=f[c][a.uuid]||{geo:a.geo||[0,0],uuid:a.uuid,last:+new Date,socket:j,namespace:c,connected:!1,slot:j.user_count++};e.last=+new Date;e.data=d.cuser;e.connected||(e.connected=!0,b.events.fire(c+"join",e))}),"user-disconnect"===a.name&&l(a.uuid))}});q&&(b.tcpKeepAlive=setInterval(b.updater(function(){var a=b.map(e,
function(a){return a});h("ping",g,{nss:a,cuser:k})},2500),500));return j}};setInterval(function(){b.disconnected||b.each(f,function(c){b.each(f[c],function(a){var b=f[c][a];5500>+new Date-b.last||a===i||l(b.uuid)})})},1E3);"undefined"!==typeof window&&b.bind("beforeunload",window,function(){h("user-disconnect","",i);return!0})})();
/* Villo Ending File */

villo.verbose && console.log("Villo Library Loaded");
