
/* Villo Analytics */

villo.analytics = {
	send: function(sender){
		if(typeof(sender) === "string"){
			//system analytics
			if(sender === "launch"){
				
			}else if(sender === "login"){
				//Send login analytic:
				
			}else if(sender === "register"){
				//Send register analytic:
				
				//NOTE: we don't send a user analytic because that is determined server-side.
			}else if(sender === ""){
				
			}
		}else if(typeof(sender) === "object"){
			//custom analytics
		}else{
			//You can't just send empty analytics.
			return false;
		}
	},
	sendAnalytic: function(analyticData){
		//TODO: Snag platform information
		//Send UA
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
				//Browser data:
				//TODO
				//Patched?
				patched: villo.patched ? "yes" : "no",
				//Raw analytic information:
				datatitle: analyticData.title,
				data: analyticData.data
			},
			onSuccess: function(transport){
				
			},
			onFailure: function(err){
				
			}
		});
	}
};
