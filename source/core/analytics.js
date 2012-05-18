
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
	}
};
