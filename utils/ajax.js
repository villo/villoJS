/* 
 * Villo Ajax
 * ==========
 * Copyright 2011 Jordan Gensler. All rights reserved.
 */
(function(){
	villo.ajax = function(url, modifiers){
		//Set up the request.
		var vAJ = new XMLHttpRequest();
		
		if (vAJ) {
			var request = new XMLHttpRequest();
			if ("withCredentials" in request) {
				//Good Browsers
				//Line up the variables to be sent.
				var sendingVars = "";
				for (x in modifiers.parameters) {
					sendingVars = sendingVars + x + "=" + modifiers.parameters[x] + "&";
				}
				
				//Set up the callback function.
				vAJ.onreadystatechange = function(){
					if (vAJ.readyState == 4 && vAJ.status == 200) {
						modifiers.onSuccess(vAJ.responseText);
					} else 
						if (vAJ.readyState == 404) {
							modifiers.onFailure();
						}
				}
				
				//Differentiate between POST and GET, and send the request.
				if (modifiers.method.toLowerCase() === "get") {
					vAJ.open("GET", url + "?" + sendingVars, true);
					vAJ.send();
				} else 
					if (modifiers.method.toLowerCase() === "post") {
						vAJ.open("POST", url, true);
						vAJ.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
						vAJ.send(sendingVars);
					}
			} else 
				if (XDomainRequest) {
					//IE - Note: Not Tested
					//Change it to a domain request.
					vAJ = new XDomainRequest();
					//Line up the variables to be sent.
					var sendingVars = "";
					for (x in modifiers.parameters) {
						sendingVars = sendingVars + x + "=" + modifiers.parameters[x] + "&";
					}
					
					//Set up the callback function.
					vAJ.onload = function(){
						modifiers.onSuccess(vAJ.responseText);
					}
					//Failure functions
					vAJ.ontimeout = function(){
						modifiers.onFailure(vAJ.responseText);
					}
					vAJ.onerror = function(){
						modifiers.onFailure(vAJ.responseText);
					}
					
					//Differentiate between POST and GET, and send the request.
					if (modifiers.method.toLowerCase() === "get") {
						vAJ.open("GET", url + "?" + sendingVars);
						vAJ.send();
					} else 
						if (modifiers.method.toLowerCase() === "post") {
							vAJ.open("POST", url);
							//vAJ.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
							vAJ.send(sendingVars);
						}
				} else {
					modifiers.onFailure();
				}
			
			// No support for Ajax.
		}
	}
})();
