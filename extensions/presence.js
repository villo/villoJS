villo.extend({
	name: "chat",
	functions: {
		presence: {
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
					channel: "VILLO/" + villo.app.id.toUpperCase() + "/" + joinObject.room.toUpperCase() + "/PRESENCE",
					message: {
						name: 'user-presence',
						data: {
							username: villo.user.username,
						}
					}
				});
				
				this._intervals[joinObject.room] = window.setInterval(function(){
					PUBNUB.publish({
						channel: "VILLO/" + villo.app.id.toUpperCase() + "/" + joinObject.room.toUpperCase() + "/PRESENCE",
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
					channel: "VILLO/" + villo.app.id.toUpperCase() + "/" + getObject.room.toUpperCase() + "/PRESENCE",
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
						channel: "VILLO/" + villo.app.id.toUpperCase() + "/" + getObject.room.toUpperCase() + "/PRESENCE",
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
					channel: "VILLO/" + villo.app.id.toUpperCase() + "/" + leaveObject.room.toUpperCase() + "/PRESENCE",
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
	}
});