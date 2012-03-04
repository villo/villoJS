
/* Villo Do Functions */
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
			villo.webLog("IT'S OVER 9000!");
		}
		//Hehehe
		return true;
	}
})();
