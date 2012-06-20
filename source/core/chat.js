
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