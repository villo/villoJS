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
