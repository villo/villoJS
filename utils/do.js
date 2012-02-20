/* 
 * Villo Do Functions
 * ==========
 * Copyright 2011 Jordan Gensler. All rights reserved.
 */
(function(){
	villo.doNothing = function(){
		//We successfully did nothing! Yay!
		return true;
	}, 
	villo.doSomething = function(){
		var strings = [];
		
		for (var i = 0; i < arguments.length; i++) {
			if (typeof(arguments[i] == "object")) {
				strings.push(JSON.stringify(arguments[i]));
			} else {
				strings.push(arguments[i]);
			}
		}
		
		villo.log("Why did you say ", strings, "?!?!?!?!?!");
		if (arguments[0] == "easterEgg") {
			//Easter Egg!
			villo.webLog("IT'S FRIDAY, FRIDAY");
			villo.webLog("GOTTA GET DOWN ON FRIDAY");
			villo.webLog("EVERYBODY'S LOOKING FORWARD TO THE WEEKEND, WEEKEND");
			villo.webLog("FRIDAY FRIDAY");
			villo.webLog("GETTING DOWN ON FRIDAY");
			villo.webLog("EVERYBODY'S LOOKING FORWARD TO THE WEEKEND");
			villo.webLog("PARTIN' PARTIN' (yeah)");
			villo.webLog("PARTIN' PARTIN' (yeah)");
			villo.webLog("FUN FUN FUN FUN");
			villo.webLog("LOOKING FORWARD TO THE WEEKEND");
		}
		//Hehehe
		return true;
	}
})();
