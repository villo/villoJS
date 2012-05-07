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