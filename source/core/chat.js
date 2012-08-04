
//TODO: Presence Callbacks:

villo.chat = {
	rooms: [],
	//Generates room name:
	buildName: function(name){
		return "VILLO.CHAT." + villo.app.id.toUpperCase() + "." + name.toUpperCase();
	},
/**
	villo.chat.join
	===============
	
    Subscribes to messages in a given chat room.
    
	Calling
	-------

	`villo.chat.join({room: string, callback: function, presence: function)`
	
	- "Room" is the name of the chat room you want to join. Rooms are app-specific, not universal.
	- The "callback" is called whenever a chat message is received. 
	- The "presence" function is called whenever a user enters or leaves the chat room. Additionally, you can get a list of users currently connected with villo.chat.presence. This parameter is optional.

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
	
	Presence
	--------
	
	If you pass a function in the presence parameter, then presence will automatically be enabled on the room. Whenever a presence event occurs, data will be passed to the presence function.
	The data passed to the function will be formatted like this:
	
		{
			"action": "join",
			"username": "admin",
			"occupancy": 12,
			"timestamp": 1339990741554,
		}
		
	- The "action" will always be "join", "leave", or "timeout".
	- The "username" is the Villo username of the user the action is associated with.
	- The "occupancy" is the current number of users in the room.
	- The "timestamp" is epoch time, in milliseconds.
	
	Additionally, you can request presence information for a specific room using villo.chat.presence.
	
	Use
	---
		
		villo.chat.join({
			room: "main",
			callback: function(message){
				//The message variable is where the goods are.
			},
			presence: function(presence){
				console.log(presence);
				if(presence.action === "join"){
					alert("User Joined! :)");
				}
				if(presence.action === "leave"){
					alert("User Left! :(")
				}
				if(presence.action === "timeout"){
					alert("User Timed Out :(")
				}
			}
		});

*/
	join: function(chatObject){
		if (villo.chat.isSubscribed(chatObject.room) === false) {
			
			//Wrappers FTW:
			var presenceEvent = function(message){
				//Pubnub uses uuid, we use username.
				message.username = message.uuid;
				delete message.uuid;
				chatObject.presence(message);
			};
			
			PUBNUB.subscribe({
				restore: true,
				channel: villo.chat.buildName(chatObject.room),
				callback: (typeof(chatObject.callback) === "function") ? function(message){chatObject.callback(message);} : function(){},
				connect: chatObject.connect || function(){},
				error: chatObject.error || function(){},
				reconnect: chatObject.reconnect || function(){},
				disconnect: chatObject.disconnect || function(){},
				
				presence: (typeof(chatObject.presence) === "function") ? presenceEvent : false
			});
			
			villo.chat.rooms.push({
				"name": chatObject.room.toUpperCase()
			});
			
			return true;
		} else {
			return true;
		}
	},
/**
	villo.chat.presence
	===================
	
    Retrieves the current presence information, specifically the users online, for a given chat room. 
    
	Calling
	-------

	`villo.chat.presence({room: string, callback: function)`
	
	- "Room" is the name of the chat room you wish to retrieve presence information for.
	- The "callback" is called when the presence data is received. 
		
	Callback
	--------
		
	An object will be passed to the callback function when the presence information is received for the chat room, and will be formatted like this:
		
		{
			"occupancy": 4,
			"users": [
				"kesne",
				"admin",
				"jeff",
				"john"
			]
		}
	
	Use
	---
		
		villo.chat.presence({
			room: "main",
			callback: function(message){
				//This will alert with the number of users online:
				alert(message.occupancy);
			}
		});
		
	Notes
	-----
	
	You can call villo.chat.presence without joining a chat room. If you wish to get push information on the presence of a specific chat room, use villo.chat.join and pass a "presence" function.

*/	
	presence: function(presenceObject){
		PUBNUB.here_now({channel: villo.chat.buildName(presenceObject.room), callback: function(message){
			message.users = message.uuids;
			delete message.uuids;
			presenceObject.callback(message);
		}});
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
	
	- "Room" is the name of the chat room you want to join. Rooms are app-specific, and you cannot send messages across different applications.
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
	
	If you pass an object in the message parameter, it will also be passed to the callback function as an object.

*/
	send: function(messageObject){
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
			channel: villo.chat.buildName(messageObject.room),
			message: pushMessage
		});
		return true;
	},
/**
	villo.chat.leaveAll
	===================
	
    Closes all of the open connections to chat rooms.
    
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
		
	Notes
	-----
	
	After leaving a chat room, both the message updates and presence updates will no longer be passed to their respective callbacks.

*/
	leaveAll: function(){
		for (var x in villo.chat.rooms) {
			if (villo.chat.rooms.hasOwnProperty(x)) {
				PUBNUB.unsubscribe({
					channel: villo.chat.buildName(villo.chat.rooms[x].name)
				});
			}
		}
		villo.chat.rooms = [];
		return true;
	},
/**
	villo.chat.leave
	================
	
    Closes a connection to a specific chat room.
    
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
		
	Notes
	-----
	
	After leaving a chat room, both the message updates and presence updates will no longer be passed to their respective callbacks.

*/
	leave: function(closerObject){
		PUBNUB.unsubscribe({
			channel: villo.chat.buildName(closerObject)
		});
		var rmv = "";
		for (var x in villo.chat.rooms) {
			if (villo.chat.rooms.hasOwnProperty(x)) {
				if (villo.chat.rooms[x].name === closerObject) {
					villo.chat.rooms.splice(x, 1);
					break;
				}
			}
		}
		return true;
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
		PUBNUB.history({
			channel: villo.chat.buildName(historyObject.room),
			limit: (historyObject.limit || 25),
			callback: function(data){
				historyObject.callback(data);
			}
		});
	}
};