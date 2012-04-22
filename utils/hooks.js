(function(){
	/*
	 * Experimental
	 */
	villo.hooks = {
		//Where we store the callbacks.
		hooks: [
			//Examples:
			{
				name: "login",
				callback: function(){}
			},
			{
				name: "account",
				callback: function(){}
			}
		],
		//The events that have been called.
		called: [],
		//Listen to an action
		listen: function(setObject){
			//Check for the name in the called array to see if we should trigger it right now.
			//Set retroactive to false in the listen function to turn off the retroactive calling.
			if(setObject.retroactive && setObject.retroactive === true){
				for(var x in this.called){
					if(this.called.hasOwnProperty(x)){
						if(this.called[x].name === setObject.name){
							setObject.callback(this.called[x].arguments);
						}
					}
				}
			}
			this.hooks.push({name: setObject.name, callback: setObject.callback});
		},
		//Call a hook
		call: function(callObject){
			//Allow for retroactive calling.
			if(callObject.retroactive && callObject.retroactive === true){
				this.called.push({name: callObject.name, arguments: callObject.arguments || true});
			}
			//Loop through hooks, trigger ones with the same name:
			for(var x in this.hooks){
				if(this.hooks.hasOwnProperty(x)){
					if(this.hooks[x].name === callObject.name){
						//Same name, trigger it!
						this.hooks[x].callback(callObject.arguments || true);
					}
				}
			}
		},
	}
})();
