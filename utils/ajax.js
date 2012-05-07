
/* Villo Ajax */
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
		},
		jsonp: modifiers.jsonp || false
	});	
}

/*
 * Utility function that is utilized if no suitable ajax is available. 
 * This should not be called directly.
 */
villo.jsonp = {
    callbackCounter: 0,
    fetch: function(url, callback) {
        var fn = 'JSONPCallback_' + this.callbackCounter++;
        window[fn] = this.evalJSONP(callback);
        url = url.replace('=JSONPCallback', '=' + fn);

        var scriptTag = document.createElement('SCRIPT');
        scriptTag.src = url;
        document.getElementsByTagName('HEAD')[0].appendChild(scriptTag);
    },
    evalJSONP: function(callback) {
        return function(data) {
            var validJSON = false;
	    if (typeof data == "string") {
	        try {validJSON = JSON.parse(data);} catch (e) {
	            /*invalid JSON*/}
	    } else {
	        validJSON = JSON.parse(JSON.stringify(data));
                window.console && console.warn(
	            'response data was not a JSON string');
            }
            if (validJSON) {
                callback(validJSON);
            } else {
                throw("JSONP call returned invalid or empty JSON");
            }
        }
    }
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
    
    var jsonp = options['jsonp'] || false;

    try {
        var xhr = new XMLHttpRequest();
        
        //Force JSONP:
        if (xhr && "withCredentials" in xhr && jsonp === true) {
        	delete xhr.withCredentials;
    	}
    	
    } catch (e) {}

    if (xhr && "withCredentials" in xhr) {
        xhr.open(type, url, true);
    }else{
    	//JSONP
    	/*
    	 * This method should be used for everything that doesn't support good AJAX. 
    	 * 
    	 * Use YQL + GET method
    	 * return in this method too, so that it doesn't try to process it as regular AJAX
    	 */
    	villo.jsonp.fetch('http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + url + "?" + data + '"') + '&format=json&callback=JSONPCallback', function(transit){
    		
			//Add debugging info:
			try{transit.query.url = url; transit.query.data = data;}catch(e){};
    		
    		//See if the stuff we care about is actually there:
    		if(transit && transit.query && transit.query.results){
    			//YQL does some weird stuff:
    			var results = transit.query.results;
    			if(results.body && results.body.p){
    				//Call success:
    				success(results.body.p, "JSONP");
    			}else{
    				error(transit);
    			}
    		}else{
    			//It's not there, call an error:
    			error(transit);
    		}
    	});
    	//Stop it from continuing to the regular AJAX function:
    	return;
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
