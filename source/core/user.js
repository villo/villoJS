/* Villo User */
villo.user = {
/**
	villo.user.login
	================
	
	Login a user to Villo using a username and password. 
    
	Calling
	-------

	`villo.user.login({username: string, password: string, callback: function})`
	
	- The "username" string should be the Villo username, as provided by the user.
	- The "password" string should be the Villo password, as provided by the user.
	- The "callback" function is called when the function is completed, letting you know if the user was logged in or not.

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
	login: function(userObject){
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
				if (token === 1 || token === 2 || token === 33 || token === 99) {
					//Error, call back with our error codes.
					//We also are using the newer callback syntax here.
					userObject.callback(token);
				} else 
					if (token.length === 32) {
						
						villo.user.strapLogin({username: userObject.username, token: token});

						userObject.callback(true);
						
						//Call the login hook.
						villo.hooks.call({name: "login"});
					} else {
						userObject.callback(33);
						villo.verbose && villo.log(33);
						villo.verbose && villo.log("Error Logging In - Undefined: " + token);
					}
			},
			onFailure: function(failure){
				userObject.callback(33);
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
	
	Logout doesn't remove any settings or other stored data. This may cause problems if you plan on having multi-account setups. Be sure to remove any residual user data that may exist in settings, states, or storage when logging out.
	
*/
	logout: function(){		
		//destroy user tokens and logout.
		villo.store.remove("token.user");
		villo.store.remove("token.token");
		//Remove the variables we're working with locally.
		delete villo.user.username;
		delete villo.user.token;
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
	register: function(userObject){
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
				if (token === 1 || token === 2 || token === 33 || token === 99) {
					//Error, call back with our error codes.
					userObject.callback(token);
				} else 
					if (token.length === 32) {
						
						villo.user.strapLogin({username: userObject.username, token: token});
						
						
						userObject.callback(true);
						
						//Call the hook
						villo.hooks.call({name: "register"});
					} else {
						userObject.callback(33);
						
						villo.verbose && villo.log(33);
						villo.verbose && villo.log("Error Logging In - Undefined: " + token);
					}
			},
			onFailure: function(failure){
				userObject.callback(33);
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
		villo.store.set("token.user", strapObject.username);
		villo.store.set("token.token", strapObject.token);
		villo.user.username = strapObject.username;
		villo.user.token = strapObject.token;
		
		//Call the hook, retroactive account.
		villo.hooks.call({name: "account"});
		
		villo.sync();
		return true;
	},
/**
	villo.user.getUsername
	======================
	
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
};
