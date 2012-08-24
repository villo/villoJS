
/**
	villo.log
	=========
	
    Acts as a wrapper for console.log, logging any parameters you pass it. If no console is available, it pushes it to an object, which you can get using villo.dumpLogs.
    
	Calling
	-------

	`villo.log(anything)`
	
	You can pass this function any arguments.
	
	Returns
	-------
	
	Returns true if the data was logged.
		
	Use
	---
		
		villo.log("test results: ", testResults, {"objects": true}, false);

*/
villo.log = function(){
	//Inspired by and based on Dave Balmer's Jo app framework (joapp.com).
	var strings = [];
	
	for (var i = 0; i < arguments.length; i++) {
		if (typeof(arguments[i] === "object")) {
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
	return true;
};
/**
	villo.webLog
	============
	
    Acts as a wrapper for console.log, and also passes the log data to Villo, which can be viewed in the Villo Developer Portal. If no console is available, it pushes it to an object, which you can get using villo.dumpLogs.
    
	Calling
	-------

	`villo.webLog(anything)`
	
	You can pass this function any arguments.
	
	Returns
	-------
	
	Returns true if the data was logged.
		
	Use
	---
		
		villo.webLog("test results: ", testResults, {"objects": true}, false);

*/
villo.webLog = function(){
	//New logging functionality, inspired by Dave Balmer's Jo app framework (joapp.com).
	var strings = [];
	
	for (var i = 0; i < arguments.length; i++) {
		if (typeof(arguments[i] === "object")) {
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
	
	var logName = "";
	if (villo.user.username && villo.user.username !== '') {
		logName = villo.user.username;
	} else {
		logName = "Guest";
	}
	
	theLog = strings.join(" ");
	
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
	return true;
};
/**
	villo.dumpLogs
	==============
	
    Get the log data, originating from calls to villo.log or villo.webLog.
    
	Calling
	-------

	`villo.dumpLogs(boolean)`
	
	- Set the boolean to true if you wish to get the logs in JSON format, and not stringified.
	
	Returns
	-------
	
	Returns a stringified version of the logs that are stored in the villo.app.logs object. If you passed "true" to the function, it will return JSON.
		
	Use
	---
		
		//Get the logs
		var logs = villo.dumpLogs(false);
		//Write them out for us to see.
		document.write(logs);

*/
villo.dumpLogs = function(useJson){
	if(useJson && useJson === true){
		return villo.app.logs;
	}else{
		return JSON.stringify(villo.app.logs);
	}
};

