
/* Villo Do Functions */
villo.doNothing = function(){
	//We successfully did nothing! Yay!
	return true;
};

villo.doSomething = function(){
	var strings = [];
	
	for (var i = 0; i < arguments.length; i++) {
		if (typeof(arguments[i] == "object")) {
			strings.push(JSON.stringify(arguments[i]));
		} else {
			strings.push(arguments[i]);
		}
	}
	
	villo.log("You said", strings);
	if (arguments[0] == "easterEgg") {
		//Easter Egg!
		villo.webLog("Suit up!");
	}
	return true;
}
