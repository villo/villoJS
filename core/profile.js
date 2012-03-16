
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
		}
	}
})();
