/* 
 * Copyright (c) 2010-2011, Villo Services. All rights reserved.
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

//Establish Namespace
villo = ({});

(function(){
	villo.apiKey = "";
	villo.version = "0.9.5 pr 2";
})();/* Villo Analytics */

//TODO:
//Error Handling on the html side
//MAYBE:
//Add villo.bridge.login and villo.bridge.register kinds.

/* Villo Bridge */
(function(){
/*
 * Villo Bridge allows for accelerated Villo development, giving developers a plug-in method for viewing Villo content.
 * ------------
 * Villo Bridge is currently Enyo-only, and uses a custom enyo-kind, set up to your specifications.
 * UPDATE: As of September 24th, the below is no longer true.
 * Bridge also is using the 1.0 (or 1.x, pending a final decision) specification for callbacks, passing a callback object as a separate object, and providing onSuccess and onFailure callbacks. 
 * The 1.0 specification also supports calling the callbacks based on the server response, by passing "specify: true".
 */

	
	//TODO: 
	//iFrames?
	//Cross-origin?
	//Security?
	//Pass Div + iFrame set content
	
	
})();
/* Villo Push Chat - Revamped in 0.9.5*/
(function(){
	villo.chat = {
		rooms: [],

/**
	villo.chat.join
	==================
	
    Subscribes to messages in a given chat room.
    
	Calling
	-------

	`villo.chat.join({room: string, callback: function})`
	
	- "Room" is the name of the chat room you want to join. Rooms are app-dependent.
	- The "Callback" is called when a chat message is received. 

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
		
	If any information was passed in the "options" object while sending the message, it will be retrived in the "extras" object in the callback object.
		
	Use
	---
		
		villo.chat.join({
			room: "VilloDemo/main",
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
						error: function(e){
							//Error connecting. PubNub will automatically attempt to reconnect.
						}
					});
					
					if(chatObject.presence && chatObject.presence.enabled && chatObject.presence.enabled == true){
						villo.chat.presence.join({
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
		
		villo.chat.isSubscribed("roomName");

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

		send: function(messageObject){
			if ('PUBNUB' in window) {
				//Build the JSON to push to the server.
				var pushMessage = {
					"username": villo.user.username,
					"message": messageObject.message,
					"extra": messageObject.options
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
	/*
		send: function(messageObject){
			if ('PUBNUB' in window) {
				//Build the JSON to push to the server.
				var pushMessage = {
					"username": villo.user.username,
					"message": messageObject.message,
					"extra": messageObject.options
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
	*/
		/**
		 * Unsubscribes to all push chat rooms currently subscribed to.
		 * @return {boolean} Returns true if the function is successfully executed.
		 * @since 0.8.0
		 */
		leaveAll: function(){
			if ('PUBNUB' in window) {
				for (x in villo.chat.rooms) {
					if (villo.chat.rooms.hasOwnProperty(x)) {
						PUBNUB.unsubscribe({
							channel: "VILLO/CHAT/" + villo.app.id.toUpperCase() + "/" + villo.chat.rooms[x].name.toUpperCase()
						});
						if(villo.chat.rooms[x].presence && villo.chat.rooms[x].presence == true){
							villo.chat.presence.leave({
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
		 * Unsubscribes to a specific push chat room.
		 * @param {object} closerObject Object containing the name of the room to unsubscribe to.
		 * @param {string} closerObject.room Name of the room to close out of.
		 * @return {boolean} Returns true if the function is successfully executed.
		 * @since 0.8.0
		 */
		leave: function(closerObject){
			if ('PUBNUB' in window) {
				PUBNUB.unsubscribe({
					channel: "VILLO/CHAT/" + villo.app.id.toUpperCase() + "/" + closerObject.room.toUpperCase()
				});
				var x;
				for (x in villo.chat.rooms) {
					if (villo.chat.rooms.hasOwnProperty(x)) {
						if (villo.chat.rooms[x].name == closerObject.room) {
							var rmv = x;
							if(villo.chat.rooms[x].presence && villo.chat.rooms[x].presence == true){
								villo.chat.presence.leave({
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
	
	villo.chat.presence = {
			rooms: {},
			
			join: function(joinObject){
				this.rooms[joinObject.room] = {users: []};
				
				this._timeouts[joinObject.room] = {};
				
				PUBNUB.subscribe({
					channel: "VILLO/PRESENCE/" + villo.app.id.toUpperCase() + "/" + joinObject.room.toUpperCase() + "",
					callback: function(evt){
						if (evt.name === "user-presence") {
							var user = evt.data.username;
							
							if (villo.chat.presence._timeouts[joinObject.room][user]) {
								clearTimeout(villo.chat.presence._timeouts[joinObject.room][user]);
							} else {
								villo.chat.presence.rooms[joinObject.room].users.push(user);
								//New User, so push event to the callback:
								if(joinObject.callback && typeof(joinObject.callback) === "function"){
									joinObject.callback({
										name: "new-user",
										data: villo.chat.presence.rooms[joinObject.room]
									});
								}
							}
							
							villo.chat.presence._timeouts[joinObject.room][user] = setTimeout(function(){
								villo.chat.presence.rooms[joinObject.room].users.splice([villo.chat.presence.rooms[joinObject.room].users.indexOf(user)], 1);
								delete villo.chat.presence._timeouts[joinObject.room][user];
								joinObject.callback({
									name: "exit-user",
									data: villo.chat.presence.rooms[joinObject.room]
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
			
			get: function(getObject){
				this._get[getObject.room] = {}
				
				PUBNUB.subscribe({
					channel: "VILLO/PRESENCE/" + villo.app.id.toUpperCase() + "/" + getObject.room.toUpperCase(),
					callback: function(evt){
						if (evt.name === "user-presence") {
							var user = evt.data.username;
							
							if (villo.chat.presence._get[getObject.room][user]) {
								
							} else {
								
							}
							
							villo.chat.presence._get[getObject.room][user] = {"username": user};
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
					for(x in villo.chat.presence._get[getObject.room]){
						returnObject.users.push(villo.chat.presence._get[getObject.room][x].username);
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
})();/* Villo Clipboard */
(function(){
	villo.clipboard = {
/**
	villo.clipboard.copy
	====================
	
    Used to copy a string of text to the villo.app.clipboard object, for retrieval at some point.
    
	Calling
	-------

	`villo.clipboard.copy("Some string of text.")`

	Returns
	-------
	
	Returns the index of the string within the villo.app.clipboard object.
	
	Use
	---
	
		villo.clipboard.copy(this.$.input.getValue());

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
/* 
 * Villo Friends
 * ==========
 * Copyright 2011 Jordan Gensler. All rights reserved.
 */
(function(){
	villo.friends = {
		/**
		 * Add a user to the logged in user's friend list.
		 * @param {object} addObject Options for the function.
		 * @param {string} addObject.username Username to add to the friend list.
		 * @param {function} getObject.callback Funtion to call once the profile is retrieved.
		 * @since 0.8.0
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
					
					villo.log(transport);
					
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
					villo.log(transport);
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
					
					villo.log(transport)
					
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
/* 
 * Villo Gift
 * ==========
 * Copyright 2011 Jordan Gensler. All rights reserved.
 */
(function(){
	//Sync them, web interface for adding gifts
	villo.gift = {
		/**
		 * Get the list of gifts in a given category
		 * @param {object} giftObject Object containing options and the callback.
		 * @param {string} giftObject.categoryStack Category to load the gifts from.
		 * @param {function} giftObject.callback Funtion to call once the gifts are retrieved from the server.
		 * @since 0.8.0
		 */
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
		/**
		 * Gets a list of the categories.
		 * @param {object} giftObject Object containing options.
		 * @param {function} giftObject.callback Funtion to call once the categories are retrieved from the server.
		 * @since 0.8.0
		 */
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
		/**
		 * Buy a specific gift
		 * @param {object} giftObject Options for the purchase.
		 * @param {string} giftObject.giftID Universal ID of the gift the user wants to buy.
		 * @param {function} giftObject.callback Funtion to call once the purchase is completed.
		 * @since 0.8.0
		 */
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
		/**
		 * Gets the number of Villo Credits your account currently contains.
		 * @param {object} giftObject Object containing options and the callback.
		 * @param {function} giftObject.callback Funtion to call once the gifts are retrieved from the server.
		 * @since 0.8.0
		 */
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
		/**
		 * Gets the purchases linked to the account currently logged in.
		 * @param {object} giftObject Object containing options and the callback.
		 * @param {function} giftObject.callback Funtion to call once the purchases are retrieved from the server.
		 * @since 0.8.0
		 */
		purchases: function(giftObject){
			villo.log(villo.user.token);
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
	
	villo.load = function(options){
		if (options.api) {
			villo.apiKey = options.api;
		}
		
		if(options.useCookies && options.useCookies == true){
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
		if(options.extensions && (typeof(options.extensions == "object")) && options.extensions.length > 0){
			var extensions = [];
			for(x in options.extensions){
				if(options.extensions.hasOwnProperty(x)){
					extensions.push(villo.script.get() + options.extensions[x]);
				}
			}
			$script(extensions, "extensions");
		}else if(options.include && (typeof(options.include == "object")) && options.include.length > 0){
			var include = [];
			for(x in options.include){
				if(options.include.hasOwnProperty(x)){
					include.push(options.include[x]);
				}
			}
			$script(include, "include");
		}else{
			villo.doPushLoad(options);
		}
		
		$script.ready("extensions", function(){
			//Load up the include files
			if(options.include && (typeof(options.include == "object") && options.include.length > 0)){
				var include = [];
				for(x in options.include){
					if(options.include.hasOwnProperty(x)){
						include.push(options.include[x]);
					}
				}
				$script(include, "include");
			}else{
				//No include, so just call the onload
				villo.doPushLoad(options);
			}
		});
		
		$script.ready("include", function(){
			villo.doPushLoad(options);
		});
		
	};
	villo.doPushLoad = function(options){
		//Villo now loads the pubnub in it's dependencies file, and as such doesn't need to pull it in here, so we just call the onload function.
		if ("VILLO_SETTINGS" in window && typeof(VILLO_SETTINGS.ONLOAD == "function")) {
			VILLO_SETTINGS.ONLOAD(true);
		}
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
    - "Limit" is an optional parameter that lets you limit the number of scores retrieved from the database, for perfomance reasons. If the parameter is not passed, a value of 30 will be used by default.

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
			callback: enyo.bind(this, this.gotLeaders),
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
					villo.log("Success!");
					villo.log(transport);
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
					villo.log("failure!");
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
    - "Limit" is an optional parameter that lets you limit the number of scores retrieved from the database, for perfomance reasons. If the parameter is not passed, a value of 30 will be used by default.

	Callback
	--------
	
	An object will be passed to the callback. The object will be formatted like this, where data is the score submitted:
	
		{"leaders":[
			{"username":"noah","data":"243","date":"2011-06-24"},
			{"username":"noahtest","data":"178","date":"2011-06-13"},
			{"username":"noahtest2","data":"93","date":"2011-06-13"},
		]}
	
	Use
	---
	
		villo.leaders.search({
			username: this.$.scoreSearch.getValue(),
			callback: enyo.bind(this, this.gotLeaders),
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
					villo.log("Success!");
					villo.log(transport);
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
					villo.log("failure!");
					getObject.callback(33);
				}
			});
		},
		
		/**
		 * Submit a score to the app's leaderboard. As of 0.8.5, multiple leaderboards are supported, as well as anonymous postings for users not logged in.
		 * @param {object} scoreObject Options for the leaderboard, and the callback.
		 * @param {string} scoreObject.score The score you wish to submit to the leaderboard.
		 * @param {string} scoreObject.board Optional parameter. This is the name of the board that you want to submit to. If none is selected, the applications name will be used.
		 * @param {function} scoreObject.callback Funtion to call once the score is submitted.
		 * @since 0.8.0
		 */
		//Redo callback
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
					villo.log(transport);
					if (transport !== "") {
						var tmprsp = JSON.parse(transport)
						if (tmprsp.leaders) {
							scoreObject.callback(tmprsp);
						} else 
							if (transport == 33 || transport == 66 || transport == 99) {
								scoreObject.callback(transport);
							} else {
								scoreObject.callback(33);
							}
					} else {
						scoreObject.callback(33);
					}
				},
				onFailure: function(failure){
					villo.log("failure!");
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
/* 
 * Villo Profile
 * ==========
 * Copyright 2011 Jordan Gensler. All rights reserved.
 */
(function(){
	villo.profile = {
		/**
		 * Get a specific user's profile
		 * @param {object} getObject Options for the function.
		 * @param {string} getObject.username Username of the user profile to get. If this param is not passed, we will use the user currently logged in.
		 * @param {function} getObject.callback Funtion to call once the profile is retrieved.
		 * @since 0.8.0
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
					username: getObject.username
				},
				onSuccess: function(transport){
					villo.log(transport);
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
		
		updateSpecific: function(updateObject){
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
					villo.log(transport);
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
		friends: function(updateObject){
			villo.log("called");
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
					villo.log("fail");
					updateObject.callback(33);
				}
			});
		}
	}
})();
/* 
 * Villo Settings
 * ==========
 * Copyright 2011 Jordan Gensler. All rights reserved.
 */
(function(){
	villo.settings = {
		//We strap the settings on to villo.app.settings.
		load: function(loadObject){
			if (loadObject.instant && loadObject.instant == true) {
				villo.app.settings = store.get("VilloSettingsProp").settings;
				return villo.app.settings;
			} else {
				var theTimestamp = store.get("VilloSettingsProp").timestamp;
				villo.storage.get({
					privacy: true,
					title: "VilloSettingsProp",
					callback: function(transit){
						transit = JSON.parse(JSON.parse(transit));
						if (!transit.storage) {
							villo.app.settings = store.get("VilloSettingsProp").settings
							loadObject.callback(store.get("VilloSettingsProp").settings);
						} else {
							if (transit.storage.timestamp > timestamp) {
								store.set("VilloSettingsProp", transit.storage);
								villo.app.settings = transit.storage.settings
								loadObject.callback(transit.storage.settings);
							} else {
								villo.app.settings = store.get("VilloSettingsProp").settings
								loadObject.callback(store.get("VilloSettingsProp").settings);
							}
						}
					}
				});
			}
		},
		save: function(saveObject){
			var settingsObject = {};
			var d = new Date();
			//Universal Timestamp Win
			var timestamp = d.getTime();
			settingsObject.timestamp = timestamp;
			settingsObject.settings = saveObject.settings;
			store.set("VilloSettingsProp", settingsObject);
			villo.app.settings = settingsObject.settings;
			villo.storage.set({
				privacy: true,
				title: "VilloSettingsProp",
				data: settingsObject
			});
		},
		destroy: function(){
			store.remove("VilloSettingsProp");
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
			store.set("VAppState", setObject);
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
					getObject.callback(store.get("VAppState"));
				}
				return store.get("VAppState");
			} else {
				villo.storage.get({
					privacy: true,
					title: "VAppState",
					callback: function(transit){
						var transit = JSON.parse(transit);
						transit.storage = JSON.parse(villo.stripslashes(transit.storage));
						
						villo.log(transit);
						if (!transit.storage) {
							getObject.callback(store.get("VAppState"));
						} else {
							getObject.callback(transit.storage);
						}
					}
				});
			}
		},
	}
})();/* 
 * Villo Cloud Storage
 * ==========
 * Copyright 2011 Jordan Gensler. All rights reserved.
 */
(function(){
	villo.storage = {
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
						addObject.callback(transport);
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
			//TODO: Finish this.
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
						getObject.callback(transport);
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
/* 
 * Villo User
 * ==========
 * Copyright 2011 Jordan Gensler. All rights reserved.
 */
(function(){
	villo.user = {
		/**
		 * Log a user into Villo.
		 * @param {object} userObject Contains the parameters to log in with.
		 * @param {string} userObject.username Username for logging in
		 * @param {string} userObject.password Account password that is associated with the username.
		 * @param {function} callback Function or javascript action to be performed once the login is completed.
		 * @return {string} Returns either an error value, or a user token.
		 * @since 0.8.0
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
					var token = transport;
					if (token == 1 || token == 2 || token == 33 || token == 99) {
						//Error, call back with our error codes.
						callback(token);
					} else 
						if (token.length == 33) {
							store.set("token.user", userObject.username);
							//returned token has a space at the beginning. No Bueno. Let's fix that. Probably should fix this server-side at some point
							token = token.substring(1);
							store.set("token.token", token);
							villo.user.username = userObject.username;
							villo.user.token = token;
							callback(true);
							villo.sync();
						//villo.log(0)
						} else {
							callback(33);
							villo.log(33);
							villo.log("Error Logging In - Undefined: " + token);
						}
					//callback(transport);
				},
				onFailure: function(failure){
					callback(33);
				}
			});
		},
		/**
		 * Log a user out of Villo.
		 * @return {boolean} Returns 1 if logout was successful.
		 * @since 0.8.0
		 */
		logout: function(){
			//destroy user tokens and logout.
			store.remove("token.token");
			store.remove("token.user");
			//Remove the variables we're working with locally.
			villo.user.username = null;
			villo.user.token = null;
			//We did it!
			return true;
		},
		/**
		 * Determine if a user is currently logged in.
		 * @return {boolean} Returns true if the user is logged in.
		 * @since 0.8.5
		 */
		isLoggedIn: function(){
			if (villo.user.username && villo.user.username !== "" && villo.user.token && villo.user.token !== "") {
				return true;
			} else {
				return false;
			}
		},
		/**
		 * Register a user for Villo.
		 * @param {object} userObject Object containing user information for registration.
		 * @param {string} userObject.username Requested username for the account.
		 * @param {string} userObject.password Password for the user account.
		 * @param {string} userObject.password_confirm The confirmation of the password for the account.
		 * @param {string} userObject.email Email of the user registering.
		 * @param {function} callback Funtion to call once registration is complete.
		 * @since 0.8.0
		 */
		register: function(userObject, callback){
				villo.ajax("https://api.villo.me/user/register.php", {
					method: 'post',
					parameters: {
						api: villo.apiKey,
						appid: villo.app.id,
						username: userObject.username,
						password: userObject.password,
						password_confirm: userObject.password_confirm,
						email: userObject.email
					},
					onSuccess: function(transport){
						//Return 0 = Successfully registered
						//Return 1 = Error in the form
						//Return 99 = Unauthorized Application
						var token = transport;
						if (token == 1 || token == 2 || token == 33 || token == 99) {
							//Error, call back with our error codes.
							callback(token);
						} else 
							if (token.length == 33) {
								store.set("token.user", userObject.username);
								//returned token has a space at the beginning. No Bueno. Let's fix that. Probably should fix this server-side at some point
								token = token.substring(1);
								store.set("token.token", token);
								villo.user.username = userObject.username;
								villo.user.token = token;
								callback(true);
								villo.sync();
							//villo.log(0)
							} else {
								callback(33);
								villo.log(33);
								villo.log("Error Logging In - Undefined: " + token);
							}
					},
					onFailure: function(failure){
						callback(33);
					}
				});
		},
		strapLogin: function(strapObject){
			store.set("token.user", strapObject.username);
			store.set("token.token", strapObject.token);
			villo.user.username = strapObject.username;
			villo.user.token = strapObject.token;
			villo.sync();
		},
		username: null,
		token: ''
	}
})();
/* 
 * Villo Ajax
 * ==========
 * Copyright 2011 Jordan Gensler. All rights reserved.
 */
(function(){
	villo.ajax = function(url, modifiers){
		//Set up the request.
		var vAJ = new XMLHttpRequest();
		
		if (vAJ) {
			var request = new XMLHttpRequest();
			if ("withCredentials" in request) {
				//Good Browsers
				//Line up the variables to be sent.
				var sendingVars = "";
				for (x in modifiers.parameters) {
					sendingVars = sendingVars + x + "=" + modifiers.parameters[x] + "&";
				}
				
				//Set up the callback function.
				vAJ.onreadystatechange = function(){
					if (vAJ.readyState == 4 && vAJ.status == 200) {
						modifiers.onSuccess(vAJ.responseText);
					} else 
						if (vAJ.readyState == 404) {
							modifiers.onFailure();
						}
				}
				
				//Differentiate between POST and GET, and send the request.
				if (modifiers.method.toLowerCase() === "get") {
					vAJ.open("GET", url + "?" + sendingVars, true);
					vAJ.send();
				} else 
					if (modifiers.method.toLowerCase() === "post") {
						vAJ.open("POST", url, true);
						vAJ.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
						vAJ.send(sendingVars);
					}
			} else 
				if (XDomainRequest) {
					//IE - Note: Not Tested
					//Change it to a domain request.
					vAJ = new XDomainRequest();
					//Line up the variables to be sent.
					var sendingVars = "";
					for (x in modifiers.parameters) {
						sendingVars = sendingVars + x + "=" + modifiers.parameters[x] + "&";
					}
					
					//Set up the callback function.
					vAJ.onload = function(){
						modifiers.onSuccess(vAJ.responseText);
					}
					//Failure functions
					vAJ.ontimeout = function(){
						modifiers.onFailure(vAJ.responseText);
					}
					vAJ.onerror = function(){
						modifiers.onFailure(vAJ.responseText);
					}
					
					//Differentiate between POST and GET, and send the request.
					if (modifiers.method.toLowerCase() === "get") {
						vAJ.open("GET", url + "?" + sendingVars);
						vAJ.send();
					} else 
						if (modifiers.method.toLowerCase() === "post") {
							vAJ.open("POST", url);
							//vAJ.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
							vAJ.send(sendingVars);
						}
				} else {
					modifiers.onFailure();
				}
			
			// No support for Ajax.
		}
	}
})();
/* 
 * Villo App
 * ==========
 * Copyright 2011 Jordan Gensler. All rights reserved.
 */
(function(){
	/*
	 * Generic/Private Functions/Housings
	 */
	villo.app = {
		//Villo.clipboard for copy and paste.
		clipboard: [],
		//All logs from villo.log get dumped here.
		logs: [],
		//A house for the app settings.
		settings: {}
	}
})();
/* 
 * Villo Do Functions
 * ==========
 * Copyright 2011 Jordan Gensler. All rights reserved.
 */
(function(){
	villo.doNothing = function(){
		//We successfully did nothing! Yay!
		return true;
	}, 
	villo.doSomething = function(){
		var strings = [];
		
		for (var i = 0; i < arguments.length; i++) {
			if (typeof(arguments[i] == "object")) {
				strings.push(JSON.stringify(arguments[i]));
			} else {
				strings.push(arguments[i]);
			}
		}
		
		villo.log("Why did you say ", strings, "?!?!?!?!?!");
		if (arguments[0] == "easterEgg") {
			//Easter Egg!
			villo.webLog("IT'S FRIDAY, FRIDAY");
			villo.webLog("GOTTA GET DOWN ON FRIDAY");
			villo.webLog("EVERYBODY'S LOOKING FORWARD TO THE WEEKEND, WEEKEND");
			villo.webLog("FRIDAY FRIDAY");
			villo.webLog("GETTING DOWN ON FRIDAY");
			villo.webLog("EVERYBODY'S LOOKING FORWARD TO THE WEEKEND");
			villo.webLog("PARTIN' PARTIN' (yeah)");
			villo.webLog("PARTIN' PARTIN' (yeah)");
			villo.webLog("FUN FUN FUN FUN");
			villo.webLog("LOOKING FORWARD TO THE WEEKEND");
		}
		//Hehehe
		return true;
	}
})();
/* Villo E & Script */
(function(){
	villo.e = {
		load: function(scriptSrc, villoRoot){
			if(villoRoot == false){
				//Load this up from the main app root.
				$script(scriptSrc);
			}else{
				$script(villo.script.get() + scriptSrc);
			}
		}
	}
	villo.script = {
		get: function(){
			var scripts = document.getElementsByTagName("script");
			for (var i = 0, s, src, l = "villo.js".length; s = scripts[i]; i++) {
				src = s.getAttribute("src") || "";
				if (src.slice(-l) == "villo.js") {
					return src.slice(0, -l - 1) + "/";
				}
			}
		}
	}
})();
/* Villo Extend */
(function(){
	/**
	 * OLD DOCUMENTATION, NEED THE NEW STUFF:
	 * 
	 * Extend or update villo's functionality.
	 * @param {string} namespace The namespace that your villo extension will live in. All extentions be pushed into the villo.e root namespace.
	 * @param {object} javascripts The functionality you want to add.
	 * @return {boolean} Returns true if the function was executed.
	 * @since 0.8.0
	 */
	villo.extend = function(extension){
		console.log("extending");
		//New Villo Extension System:
		if (extension.name === "VIroot") {
			villo += extension.functions;
		} else {
			if (villo[extension.name] && typeof(villo[extension.name]) == "object") {
				//Add-on
				villo.mixin(villo[extension.name], extension.functions);
			} else {
				//OG
				villo[extension.name] = extension.functions;
			}
			if (typeof(villo[extension.name].init) == "function") {
				villo[extension.name].init();
				if (extension.cleanAfterUse && extension.cleanAfterUse == true) {
					delete villo[extension.name].init;
				}
			}
		}
		
	}, villo.mixin = function(destination, source){
		for (var k in source) {
			if (source.hasOwnProperty(k)) {
				destination[k] = source[k];
			}
		}
		return destination;
	}
})();/* 
 * Villo Framework Loader
 * This shouldn't be used any longer. We've built in the framework loader to the villo.load function.
 */
(function(){
	villo.loadFramework = function(frameworkName, options){
		if (frameworkName == "pubnub") {
			
			if(options.pub && options.pub !== ""){
				
			}else{
				options.pub = "pub-42c6b905-6d4e-4896-b74f-c1065ab0dc10";
			}
			
			if(options.sub && options.sub !== ""){
				
			}else{
				options.sub = "sub-4e37d063-edfa-11df-8f1a-517217f921a4";
			}
			
			var connect = document.createElement('script'), attr = '', attrs = {
				'pub-key': options.pub,
				'sub-key': options.sub,
				'id': 'comet-connect',
				'src': 'http://cdn.pubnub.com/pubnub-3.1.min.js',
				'origin': 'pubsub.pubnub.com'
			};
			for (attr in attrs) {
				connect.setAttribute(attr, attrs[attr]);
			}
			document.getElementsByTagName('head')[0].appendChild(connect);
			
			villo.pubby({
				callback: function(PUBNUB){
					villo.log("PubNub loaded, Push is ready.");
					villo.pushFramework = "pubnub";
				}
			});
			
		}
	}
	villo.pubby = function(readyFunction){
		if ('PUBNUB' in window) {
			readyFunction.callback(PUBNUB);
		} else {
			setTimeout(function(){
				villo.pubby(readyFunction)
			}, 100);
		}
	}
})();
/* 
 * Villo Log
 * ==========
 * Copyright 2011 Jordan Gensler. All rights reserved.
 */
(function(){
	/**
	 * Acts as a wrapper for console.log. If no console is availible, it pushes it to an object, which you can get using villo.dumpLogs. You can pass this function any parameters.
	 * @since 0.8.1
	 */
	villo.log = function(){
		//New logging functionality, inspired by and based on Dave Balmer's Jo app framework (joapp.com).
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
	}
	
	/**
	 * Acts as a wrapper for console.log, and also passes the log to the cloud, which can be viewed in the Villo Developer Portal. If no console is availible, it pushes it to an object, which you can get using villo.dumpLogs. You can pass this function any parameters.
	 * @param {anything}
	 * @since 0.8.1
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
	}
	
	/**
	 * Returns a stringified version of the logs that are stored in the villo.app.logs object.
	 * @return {string} Returns the string of logs.
	 * @since 0.8.1
	 */
	villo.dumpLogs = function(){
		return JSON.stringify(villo.app.logs);
	}
})();
/* 
 * Villo Slash Control
 * ==========
 * Copyright 2011 Jordan Gensler. All rights reserved.
 */
(function(){
	//Adds slashes into any string to prevent it from breaking the JS.
	villo.addSlashes = function(string){
		string = string.replace(/\\/g, '\\\\');
		string = string.replace(/\'/g, '\\\'');
		string = string.replace(/\"/g, '\\"');
		string = string.replace(/\0/g, '\\0');
		return string;
	}, villo.stripslashes = function(str){
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
	}
})();
/* Villo Sync */

//TODO: Needs more client-end management on the data-usage end of things. We probably shouldn't ping the server if we open the app twice in a row.

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
 * json2.js 
 * Public Domain
 * See http://www.JSON.org/js.html
 */
var JSON;if(!JSON){JSON={};}
(function(){"use strict";function f(n){return n<10?'0'+n:n;}
if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+
f(this.getUTCMonth()+1)+'-'+
f(this.getUTCDate())+'T'+
f(this.getUTCHours())+':'+
f(this.getUTCMinutes())+':'+
f(this.getUTCSeconds())+'Z':null;};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf();};}
var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+string+'"';}
function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key);}
if(typeof rep==='function'){value=rep.call(holder,key,value);}
switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null';}
gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null';}
v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v;}
if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==='string'){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}
v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v;}}
if(typeof JSON.stringify!=='function'){JSON.stringify=function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' ';}}else if(typeof space==='string'){indent=space;}
rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify');}
return str('',{'':value});};}
if(typeof JSON.parse!=='function'){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}
return reviver.call(holder,key,value);}
text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+
('0000'+a.charCodeAt(0).toString(16)).slice(-4);});}
if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j;}
throw new SyntaxError('JSON.parse');};}}());


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
 * PubNub-3.1.js 
 * See http://www.pubnub.com
 * This was moved here due to problemss with the async loader.
 */

function s(){return function(){}}
window.JSON&&window.JSON.stringify||function(){function y(c){k.lastIndex=0;return k.test(c)?'"'+c.replace(k,function(c){var g=f[c];return typeof g==="string"?g:"\\u"+("0000"+c.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+c+'"'}function u(c,f){var g,h,o,m,k=i,l,e=f[c];e&&typeof e==="object"&&typeof e.toJSON==="function"&&(e=e.toJSON(c));typeof p==="function"&&(e=p.call(f,c,e));switch(typeof e){case "string":return y(e);case "number":return isFinite(e)?String(e):"null";case "boolean":case "null":return String(e);
case "object":if(!e)return"null";i+=t;l=[];if(Object.prototype.toString.apply(e)==="[object Array]"){m=e.length;for(g=0;g<m;g+=1)l[g]=u(g,e)||"null";o=l.length===0?"[]":i?"[\n"+i+l.join(",\n"+i)+"\n"+k+"]":"["+l.join(",")+"]";i=k;return o}if(p&&typeof p==="object"){m=p.length;for(g=0;g<m;g+=1)h=p[g],typeof h==="string"&&(o=u(h,e))&&l.push(y(h)+(i?": ":":")+o)}else for(h in e)Object.hasOwnProperty.call(e,h)&&(o=u(h,e))&&l.push(y(h)+(i?": ":":")+o);o=l.length===0?"{}":i?"{\n"+i+l.join(",\n"+i)+"\n"+
k+"}":"{"+l.join(",")+"}";i=k;return o}}window.JSON||(window.JSON={});if(typeof String.prototype.toJSON!=="function")String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()};var k=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,i,t,f={"\u0008":"\\b","\t":"\\t","\n":"\\n","\u000c":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},p;typeof JSON.stringify!=="function"&&(JSON.stringify=function(c,
f,g){var h;t=i="";if(typeof g==="number")for(h=0;h<g;h+=1)t+=" ";else typeof g==="string"&&(t=g);if((p=f)&&typeof f!=="function"&&(typeof f!=="object"||typeof f.length!=="number"))throw Error("JSON.stringify");return u("",{"":c})});typeof JSON.parse!=="function"&&(JSON.parse=function(c){return eval("("+c+")")})}();
window.PUBNUB||function(){function y(a){var b={},d=a.publish_key||"pub-42c6b905-6d4e-4896-b74f-c1065ab0dc10",q=a.subscribe_key||"sub-4e37d063-edfa-11df-8f1a-517217f921a4",r=a.ssl?"s":"",v="http"+r+"://"+(a.origin||"pubsub.pubnub.com"),n={history:function(a,b){var b=a.callback||b,d=a.limit||100,j=a.channel,c=e();if(!j)return f("Missing Channel");if(!b)return f("Missing Callback");w({c:c,url:[v,"history",q,z(j),c,d],b:function(a){b(a)},a:function(a){f(a)}})},time:function(a){var b=e();w({c:b,url:[v,"time",b],b:function(b){a(b[0])},a:function(){a(0)}})},uuid:function(a){var b=
e();w({c:b,url:["http"+r+"://pubnub-prod.appspot.com/uuid?callback="+b],b:function(b){a(b[0])},a:function(){a(0)}})},analytics:function(a){var b=e(),c=a.limit||100,j=a.ago||0,f=a.duration||100,v=a.callback;w({c:b,b:function(a){v(a)},a:function(){v(0)},url:[["http"+r+"://pubnub-prod.appspot.com/analytics-channel?callback="+b,"sub-key="+q,"pub-key="+d,"channel="+z(a.channel||""),"limit="+c,"ago="+j,"duration="+f].join("&")]})},publish:function(a,b){var b=b||a.callback||s(),c=a.message,j=a.channel,r=
e();if(!c)return f("Missing Message");if(!j)return f("Missing Channel");if(!d)return f("Missing Publish Key");c=JSON.stringify(c);c=[v,"publish",d,q,0,z(j),r,z(c)];if(c.join().length>1800)return f("Message Too Big");w({c:r,b:function(a){b(a)},a:function(){b([0,"Disconnected"])},url:c})},unsubscribe:function(a){a=a.channel;if(a in b)b[a].d=0,b[a].e&&b[a].e(0)},subscribe:function(a,d){function r(){var a=e();if(b[j].d)b[j].e=w({c:a,url:[m,"subscribe",q,z(j),a,h],a:function(){setTimeout(r,A);n.time(function(a){a||
i()})},b:function(a){b[j].d&&(k||(k=1,l()),g=C.set(q+j,h=g&&C.get(q+j)||a[1]),c(a[0],function(b){d(b,a)}),setTimeout(r,10))}})}var j=a.channel,d=d||a.callback,g=a.restore,h=0,i=a.error||s(),k=0,l=a.connect||s(),m=N(v);if(!D)return I.push([a,d,n]);if(!j)return f("Missing Channel");if(!d)return f("Missing Callback");if(!q)return f("Missing Subscribe Key");j in b||(b[j]={});if(b[j].d)return f("Already Connected");b[j].d=1;r()},db:C,each:c,map:G,css:H,$:t,create:l,bind:h,supplant:g,head:o,search:p,attr:m,
now:k,unique:u,events:B,updater:i,init:y};return n}function u(){return"x"+ ++O+""+ +new Date}function k(){return+new Date}function i(a,b){function d(){c+b>k()?(clearTimeout(q),q=setTimeout(d,b)):(c=k(),a())}var q,c=0;return d}function t(a){return document.getElementById(a)}function f(a){console.log(a)}function p(a,b){var d=[];c(a.split(/\s+/),function(a){c((b||document).getElementsByTagName(a),function(a){d.push(a)})});return d}function c(a,b){if(a&&b)if(typeof a[0]!="undefined")for(var d=0,c=a.length;d<
c;)b.call(a[d],a[d],d++);else for(d in a)a.hasOwnProperty&&a.hasOwnProperty(d)&&b.call(a[d],d,a[d])}function G(a,b){var d=[];c(a||[],function(a,c){d.push(b(a,c))});return d}function g(a,b){return a.replace(P,function(a,c){return b[c]||a})}function h(a,b,d){c(a.split(","),function(a){function c(a){if(!a)a=window.event;if(!d(a))a.cancelBubble=true,a.returnValue=false,a.preventDefault&&a.preventDefault(),a.stopPropagation&&a.stopPropagation()}b.addEventListener?b.addEventListener(a,c,false):b.attachEvent?
b.attachEvent("on"+a,c):b["on"+a]=c})}function o(){return p("head")[0]}function m(a,b,d){if(d)a.setAttribute(b,d);else return a&&a.getAttribute&&a.getAttribute(b)}function H(a,b){for(var d in b)if(b.hasOwnProperty(d))try{a.style[d]=b[d]+("|width|height|top|left|".indexOf(d)>0&&typeof b[d]=="number"?"px":"")}catch(c){}}function l(a){return document.createElement(a)}function e(){return E||n()?0:u()}function z(a){return G(encodeURIComponent(a).split(""),function(a){return"-_.!~*'()".indexOf(a)<0?a:"%"+
a.charCodeAt(0).toString(16).toUpperCase()}).join("")}function w(a){function b(a,b){if(!f)f=1,a||i(b),d.onerror=null,clearTimeout(g),setTimeout(function(){a&&h();var b=t(e),d=b&&b.parentNode;d&&d.removeChild(b)},A)}if(E||n())return Q(a);var d=l("script"),c=a.c,e=u(),f=0,g=setTimeout(function(){b(1)},F),h=a.a||s(),i=a.b||s();window[c]=function(a){b(0,a)};d[J]=J;d.onerror=function(){b(1)};d.src=a.url.join(K);m(d,"id",e);o().appendChild(d);return b}function Q(a){function b(a){if(!e){e=1;clearTimeout(g);
if(c)c.onerror=c.onload=null,c.abort&&c.abort(),c=null;a&&h()}}function d(){if(!f){f=1;clearTimeout(g);try{response=JSON.parse(c.responseText)}catch(a){return b(1)}i(response)}}var c,e=0,f=0,g=setTimeout(function(){b(1)},F),h=a.a||s(),i=a.b||s();try{c=n()||window.XDomainRequest&&new XDomainRequest||new XMLHttpRequest,c.onerror=function(){b(1)},c.onload=d,c.timeout=F,c.open("GET",a.url.join(K),true),c.send()}catch(k){return b(0),E=0,w(a)}return b}function L(){PUBNUB.time(k);PUBNUB.time(function(){setTimeout(function(){D||
(D=1,c(I,function(a){a[2].subscribe(a[0],a[1])}))},A)})}function n(){if(!M.get)return 0;var a={id:n.id++,send:s(),abort:function(){a.id={}},open:function(b,c){n[a.id]=a;M.get(a.id,c)}};return a}window.console||(window.console=window.console||{});console.log||(console.log=(window.opera||{}).postError||s());var C=function(){var a=window.localStorage;return{get:function(b){return a?a.getItem(b):document.cookie.indexOf(b)==-1?null:((document.cookie||"").match(RegExp(b+"=([^;]+)"))||[])[1]||null},set:function(b,
c){if(a)return a.setItem(b,c)&&0;document.cookie=b+"="+c+"; expires=Thu, 1 Aug 2030 20:00:00 UTC; path=/"}}}(),O=1,P=/{([\w\-]+)}/g,J="async",K="/",F=14E4,A=1E3,E=navigator.userAgent.indexOf("MSIE 6")==-1,N=function(){var a=Math.floor(Math.random()*9)+1;return function(b){return b.indexOf("pubsub")>0&&b.replace("pubsub","ps"+(++a<10?a:a=1))||b}}(),B={list:{},unbind:function(a){B.list[a]=[]},bind:function(a,b){(B.list[a]=B.list[a]||[]).push(b)},fire:function(a,b){c(B.list[a]||[],function(a){a(b)})}},
x=t("pubnub")||{},D=0,I=[];PUBNUB=y({publish_key:m(x,"pub-key"),subscribe_key:m(x,"sub-key"),ssl:m(x,"ssl")=="on",origin:m(x,"origin")});H(x,{position:"absolute",top:-A});if("opera"in window||m(x,"flash"))x.innerHTML="<object id=pubnubs type=application/x-shockwave-flash width=1 height=1 data=https://dh15atwfs066y.cloudfront.net/pubnub.swf><param name=movie value=https://dh15atwfs066y.cloudfront.net/pubnub.swf /><param name=allowscriptaccess value=always /></object>";var M=t("pubnubs")||{};h("load",
window,function(){setTimeout(L,0)});PUBNUB.rdx=function(a,b){if(!b)return n[a].onerror();n[a].responseText=unescape(b);n[a].onload()};n.id=A;window.jQuery&&(window.jQuery.PUBNUB=PUBNUB);typeof module!=="undefined"&&(module.f=PUBNUB)&&L()}();

/* Villo Ending File */

//As per the 1.0 plans, we don't load the info.villo file automatically, so check for the legacy variable.
if ("VILLO_SETTINGS" in window && VILLO_SETTINGS.USELEGACY === true) {
	console.log("Using legacy setting, automatically loading info.villo.");
	//Load up info.villo as a javascript file.
	$script(villo.script.get() + "info.villo");
}else{
	console.log("Villo Library Loaded");
}
