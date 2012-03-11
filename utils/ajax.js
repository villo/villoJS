
/* Villo Ajax */
(function(){
/**
	villo.ajax
	=================
	
    Cross-platform, cross-browser Ajax function. This is used by Villo to connect to the Villo APIs.
    
	Calling
	-------

	`villo.ajax(url, {method: string, parameters: object, onSuccess: function, onFailure: function})`
	
	- The "url" should be a string, which contains the URL (in full) of the file you wish to get through Ajax.
	- The "method" is a string which sets which method ("GET" or "POST") you wish to use when using the Ajax function.
	- The "parameters" objects sets the parameters to sent to the web service. These will be sent using the method you set in the method argument.
	- "onSuccess" is called after the Ajax request is completed. A string containing the response to the server will be passed to this function.
	- The "onFailure" function will be called if there was a problem with the Ajax request.
		
	Use
	---
	
		villo.ajax("http://mysite", {
			method: 'post', //You can also set this to "get".
			parameters: {
				"hello": "world"
			},
			onSuccess: function(transport){
				//The string of the response is held in the "transport" variable!
			},
			onFailure: function(err){
				//Something went wrong! Error code is held in the "err" variable.
			}
		});
	
	Notes
	-----
	
	On most modern browsers, cross-domain Ajax requests are allowed. However, there may still be issues with the server rejecting requests from different origins.
	
	Most of the Villo APIs require that your web browser supports cross-domain Ajax requests. If your browser does not support them, then you will likely not be able to use a majorty of Villo features.

*/

//TODO: JSONP fallback w/ YQL?

	villo.ajax = function(url, modifiers){
		//Set up the request.
		var sendingVars = "";
		if(modifiers.parameters && typeof(modifiers.parameters) === "object"){
			for (var x in modifiers.parameters) {
				sendingVars +=  escape(x) + "=" + escape(modifiers.parameters[x]) + "&";
			}
		}
		
		//Differentiate between POST and GET, and send the request.
		if (modifiers.method.toLowerCase() === "post") {
			var method = "POST";
		} else {
			var method = "GET"
		}
		
		//Send to the actual ajax function.
		villo._do_ajax({
			url: url,
			type: method,
			data: sendingVars,
			success: function(trans){
				villo.verbose && console.log(trans);
				modifiers.onSuccess(trans);
			},
			error: function(error){
				villo.verbose && console.log(error);
				modifiers.onFailure(error);
			}
		});	
	}
	//This function does the actual Ajax request.
	villo._do_ajax = function(options){
		//Internet Explorer checker:
		var is_iexplorer = function() {
	        return navigator.userAgent.indexOf('MSIE') != -1
	    }
	    
        var url = options['url'];
        var type = options['type'] || 'GET';
        var success = options['success'];
        var error = options['error'];
        var data = options['data'];

        try {
            var xhr = new XMLHttpRequest();
        } catch (e) {}

        var is_sane = false;

        if (xhr && "withCredentials" in xhr) {
            xhr.open(type, url, true);
        } else if (typeof XDomainRequest != "undefined") {
        	//Internet Explorer
        	
        	/*
        	 * Check if the client is requesting on a non-secure browser and reset API endpoints accordingly.
        	 */
        	if(window.location.protocol.toLowerCase() === "http:"){
        		//Reset the URL to http:
        		url = url.replace(/https:/i, "http:");
        	}else if(window.location.protocol.toLowerCase() === "https:"){
        		//Reset the URL to https:
        		url = url.replace(/http:/i, "https:");
        	}else{
        		//Not HTTP or HTTPS. We can't do anything else with XDomainRequest!
        		error("Protocol is not supported.");
        		//Stop Running:
        		return false;
        	}
        	
            xhr = new XDomainRequest();
            xhr.open(type, url);
        } else{
        	xhr = null;
        }

        if (!xhr) {
        	error("Ajax is not supported on your browser.");
        	return false;
        } else {
            var handle_load = function (event_type) {
                    return function (XHRobj) {
                        // stupid IExplorer!!!
                        var XHRobj = is_iexplorer() ? xhr : XHRobj;

                        if (event_type == 'load' && (is_iexplorer() || XHRobj.readyState == 4) && success) success(XHRobj.responseText, XHRobj);
                        else if (error) error(XHRobj);
                    }
                };

            try {
                // withCredentials is not supported by IExplorer's XDomainRequest and it has weird behavior anyway
                xhr.withCredentials = false;
            } catch (e) {};

            xhr.onload = function (e) {
                handle_load('load')(is_iexplorer() ? e : e.target)
            };
            xhr.onerror = function (e) {
                handle_load('error')(is_iexplorer() ? e : e.target)
            };
            if(type.toLowerCase() === "post"){
            	//There were issues with how Post data was being handled, and setting this managed to fix all of the issues.
            	//Ergo, Villo needs this:
            	if("setRequestHeader" in xhr){
            		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            	}
            }
            xhr.send(data);
        }
	}
})();
