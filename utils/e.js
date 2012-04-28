
/* Villo E & Script */
(function(){
	villo.script = {
		get: function(){
			var scripts = document.getElementsByTagName("script");
			for (var i = 0, s, src, l = "villo.js".length; s = scripts[i]; i++) {
				src = s.getAttribute("src") || "";
				if (src.slice(-l) == "villo.js") {
					return src.slice(0, -l - 1) + "/";
				}
			}
		},
		add: function(o){
			var s = document.createElement("script");
	        s.type = "text/javascript";
	        
	        //Goes nuts on the cache:
	        //s.async = true;
	    
	        s.src = o;
	        document.getElementsByTagName('head')[0].appendChild(s);
		}
	};
	villo.style = {
		add: function(o){
			var s = document.createElement("link");
	        s.type = "text/css";
	        s.rel = "stylesheet";
	        s.href = o;
	        document.getElementsByTagName('head')[0].appendChild(s);
		}
	}
})();
