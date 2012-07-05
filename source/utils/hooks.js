
/*
 * Experimental
 */
villo.hooks = {
	//Where we store the callbacks.
	hooks: [],
	//The events that have been called.
	called: {},
	
/**
	villo.hooks.listen
	=================
	
	Listen on a specific hook and fire a callback when the hook is activated.
    
	Calling
	-------

	`villo.hooks.listen({name: string, callback: function, retroactive: boolean})`
	
	- The "name" string is the name of the hook that you want to listen to.
	- The "callback" is the function that is called once the hook is triggered by villo.hooks.call.
	- The "retroactive" boolean lets you listen to hooks that have already been called before the listen method is run. This defaults to false.
	
	Callback
	--------
	
	The callback function will be called with the boolean "true" when the hook is called, unless the user provides arguments in villo.hooks.call.
		
	Use
	---
		
		villo.hooks.listen({
			name: "myHook",
			callback: function(){
				//This is called when the hook is triggered.
				alert("The hook was called!");
			},
			//We don't care if the hook was called in the past:
			retroactive: true
		});
		
	Hooks
	-----
	
	Villo will automatically call certain hooks, which are outlined below.
	
	- *login* - Called when a user successfully logs in. 
	- *register* - Called when a user successfully registers.
	- *logout* - Called when villo.user.logout is called.
	- *account* - Essentially the "login" and "register" hooks combined. Called when a Villo account is loaded.
	- *load* - Called when villo.load is completed (including all include and extension files).
	- *patch* - Called once the patch file is loaded and applied.
	- *settings* - If you use villo.settings in your application, they will automatically be loaded when villo.load is called. This hook is called when the initial settings load is completed.
	
	Notes
	-----
	
	You can call villo.hooks.listen multiple times with the same hook name and different callbacks, and every callback will be triggered when the hook is triggered.

*/
	listen: function(setObject){
		//Check for the name in the called object to see if we should trigger it right now.
		//Set retroactive to false in the listen function to turn off the retroactive calling.
		if(setObject.retroactive && setObject.retroactive === true){
			if(this.called[setObject.name]){
				setObject.callback(this.called[setObject.name].args);
			}
		}
		this.hooks.push({name: setObject.name, callback: setObject.callback});
	},
	unlisten: function(){
		//TODO
	},
	//Call a hook
	call: function(callObject){
		//Prevent retroactive calling.
		if(callObject.retroactive && callObject.retroactive === false){
			//Don't add retroactive calling.
		}else{
			//Update with latest arguments:
			this.called[callObject.name] = {name: callObject.name, args: callObject.args || true};
		}
		//Loop through hooks, trigger ones with the same name:
		for(var x in this.hooks){
			if(this.hooks.hasOwnProperty(x)){
				if(this.hooks[x].name === callObject.name){
					//Same name, trigger it!
					this.hooks[x].callback(callObject.args || true);
				}
			}
		}
	}
};
