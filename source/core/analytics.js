
/* Villo Analytics */

villo.analytics = {
	enable: function(){
		this.enabled = true;
		//Load this up:
		this.load();
	},
	disable: function(){
		this.enabled = false;
	},
	send: function(sender){
		//System analytics: 
		if(typeof(sender) === "string"){
			//Only send system analytics if they're enabled:
			if(this.enabled){
				if(sender === "launch"){
					//Only send a launch once:
					if(this.launched){
						this.launched = true;
						this.sendAnalytic({
							title: "villo-launch",
							data: "true"
						});
					}else{
						//Already sent this instance:
						return true;
					}
				}else if(sender === "login"){
					//Send login analytic:
					this.sendAnalytic({
						title: "villo-login",
						data: "true"
					});
				}else if(sender === "register"){
					//Send register analytic:
					this.sendAnalytic({
						title: "villo-register",
						data: "true"
					});
				}
			}else{
				return false;
			}
		}else if(typeof(sender) === "object"){
			//custom analytics
			if(!this.enabled){
				if(sender.force && sender.force === true){
					//Continue, my brave soldier...
				}else{
					//Analytics stopped by disable function:
					return false;
				}
			}
			
			if(sender.title && sender.data && villo.trim(sender.title) !== "" && villo.trim(sender.data) !== ""){
				if(typeof(sender.data) === "object"){
					sender.data = JSON.stringify(sender.data);
				}
				this.sendAnalytic({
					title: sender.title,
					data: sender.data
				});
				return true;
			}
			return false;
		}else{
			//You can't just send empty analytics.
			return false;
		}
	},
	//
	// Utility function, should not be called:
	//
	sendAnalytic: function(analyticData){
		villo.ajax("https://api.villo.me/analytics.php", {
			method: 'post',
			parameters: {
				//Stuff we always send:
				api: villo.apiKey,
				appid: villo.app.id,
				//User data: (the server will determine if it's valid. If not, it'll count as not-logged-in)
				username: villo.user.getUsername() || "",
				token: villo.user.token || "",
				//App data:
				version: villo.app.version,
				title: villo.app.title,
				type: villo.app.type,
				//Patched?
				patched: villo.patched ? "yes" : "no",
				//Raw analytic information:
				datatitle: analyticData.title,
				data: analyticData.data
			},
			onSuccess: function(transport){
				console.log(transport);
			},
			onFailure: function(err){
				
			}
		});
	},
	
	//
	// Utility functions, should not be called:
	//
	load: function(){
		if(!this.loaded){
			//Prevent this from being called again:
			this.loaded = true;
			//Set up hooks for system events:
			villo.hooks.listen({
				name: "load",
				retroactive: true,
				callback: function(){
					villo.analytics.send("launch");
				},
				protect: true
			});
			villo.hooks.listen({
				name: "login",
				retroactive: true,
				callback: function(){
					villo.analytics.send("login");
				},
				protect: true
			});
			villo.hooks.listen({
				name: "register",
				retroactive: true,
				callback: function(){
					villo.analytics.send("register");
				},
				protect: true
			});
		}
	},
	
	// Utility Variables: 
	loaded: false,
	launched: false
};
