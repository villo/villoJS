
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
	- The "presence" object contains the "enabled" bool. Setting this to true opens up a presence channel, which tracks the users in a given chatroom. This can also be done with villo.chat.presence.join

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
	villo.chat.leave
	==================
	
    Closes a connection to a specific chat room. If a presence room was joined when the chat room was joined, the connection to the presence room will also be closed.
    
	Calling
	-------

	`villo.chat.leave(string)`
	
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
	/*
	 * TODO:
	 * Document out the presence APIs.
	 */
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
			//Also use get as a medium to access villo.chat.presence.get
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
})();