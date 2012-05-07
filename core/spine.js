


//Spine.js
//Pubnub wrapped all nice, with a http rest API for developers to push (via secret developer keys).
//Subscribe client-side.



/* Villo Spine */
villo.spine = {
	start: function(startObject){
		//Ajax For History.
		/*
		 * Get Request
		 * Get Last Request Timestamp
		 * Get data from database
		 * Compare stored Timestamps, pass back missed announcements
		 * Set new timestamp
		 */
		
		//Every time a new message is retrieved, we ping the server to update that time as our lastest online time.

		/*
		 * How User List Works:
		 * --------------------
		 * The server keeps a list of the users online.
		 * Every time a new user joins, we publish the current user list over pubnub.
		 * Therefore, when a user joins, he is instantly greeted by a users online list.
		 * Users online are based on timestamps. If someone has been active in the past 5 minutes, we show them to be online.
		 * We have an automated loop which pushes an update to the server every 4 minutes, telling it to keep our account active.
		 * A list of online users is kept in villo.spine.userList
		 */
		
		//Format:
		var spineData = {
			type: "announcement",
			data: "someDataString"
		}
		
		var spineData = {
			type: "leaderboard",
			subType: "ew",
			data: "someDataString"
		}
		
		
		
		//Connect To Pubnub
		if (villo.pushFramework == "pubnub") {
			PUBNUB.subscribe({
				channel: "VILLO/SPINE/" + villo.app.id.toUpperCase(),
				callback: function(message){
					startObject.callback(message);
				}
			});
		}
	},
	//private:
	updater: function(){
		//Ping the API server, telling it to revive our session. 
		villo.ajax("https://api.villo.me/spine.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				type: "keepAlive",
				username: villo.user.username,
				token: villo.user.token
			},
			onSuccess: function(transport){
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
	}
}
