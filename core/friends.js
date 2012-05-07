
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

