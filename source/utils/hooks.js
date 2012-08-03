
/*
 * Experimental
 */
villo.hooks = {
	//Where we store the callbacks.
	hooks: [],
	//The events that have been called.
	called: {},
	//Reserved hook names. We don't do anything with these, but it's handy to have a reference.
	reserved: [
		"login",
		"register",
		"logout",
		"account",
		"load",
		"patch",
		"settings"
	],
	
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
	
	Returns
	-------
	
	Returns a reference to the listener, which you can use to remove the listener through villo.hooks.unlisten.
	
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
				setObject.callback.apply(this, this.called[setObject.name].args || [true]);
			}
		}
		var obj = {
			name: setObject.name,
			callback: setObject.callback,
			protect: setObject.protect || false
		};
		return (parseInt(this.hooks.push(obj), 10) - 1);
	},
/**
	villo.hooks.unlisten
	====================
	
	Removes a callback on a specific hook that has previously been registered through villo.hooks.listen.
    
	Calling
	-------

	`villo.hooks.unlisten(hookReference)`
	
	- The only argument the function takes is a reference to the original villo.hooks.listen call.
	
	Returns
	-------
	
	Will return true if the the hook listener was removed.
		
	Use
	---
		
		var hook = villo.hooks.listen({
			name: "myHook",
			callback: function(){
				alert("The hook was called!");
			},
		});
		
		villo.hooks.unlisten(hook);
	
	Notes
	-----
	
	Because villo.hooks.listen returns an index of the listener, you can pass villo.hooks.unlisten a number as well. This is not recommended.

*/
	unlisten: function(index){
		if(this.hooks[index]){
			//Block protected listeners:
			if(!this.hooks[index].protect){
				//Using splice resets the indexes:
				delete this.hooks[index];
				return true;
			}else{
				return false;
			}
		}else{
			return false;
		}
	},
/**
	villo.hooks.call
	================
	
	Calls a specific hook, which triggers all of the callbacks registered to that hook to fire.
    
	Calling
	-------

	`villo.hooks.unlisten({name: string, args: array, async: boolean})`
	
	- The "name" string is the name of the hook that you want to call.
	- The "args" array will be sent to all of the listener callbacks, created with villo.hooks.listen.
	- The "async" boolean allows you to call the functions asynchronously. This defaults to false, and is optional. 
	
	Returns
	-------
	
	Will return true if the the hook was called.
		
	Use
	---
		
		villo.hooks.listen({
			name: "myHook",
			callback: function(yourName, myName){
				alert("Hello, " + yourName + ". My name is " + myName + "." );
			},
		});
		
		villo.hooks.call({
			name: "myHook",
			args: ["Jordan", "Jeff"]
		});
	
	Hooks
	-----
	
	Villo will automatically call certain hooks, which are outlined below. It is recommended that you do _not_ call these hooks in your own code.
	
	- *login*
	- *register*
	- *logout*
	- *account*
	- *load*
	- *patch*
	- *settings*
	
	Notes
	-----
	
	The args array will get applied to the function, and will not be passed as a traditional array. You can read about the apply method [here](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/apply).

*/
	call: function(callObject){
		//Prevent retroactive calling.
		if(callObject.retroactive && callObject.retroactive === false){
			//Don't add retroactive calling.
		}else{
			//Update with latest arguments:
			this.called[callObject.name] = {name: callObject.name, args: callObject.args || [true]};
		}
		
		var asyncCaller = villo.bind(this, function(callback){
			return function(){
				callback.apply(villo.global, callObject.args || [true]);
			};
		});
		
		//Loop through hooks, trigger ones with the same name:
		for(var x in this.hooks){
			if(this.hooks.hasOwnProperty(x)){
				if(this.hooks[x].name === callObject.name){
					if(callObject.async){
						window.setTimeout(asyncCaller(this.hooks[x].callback), 1);
					}else{
						this.hooks[x].callback.apply(villo.global, callObject.args || [true]);
					}
				}
			}
		}
		
		return true;
	}
};
