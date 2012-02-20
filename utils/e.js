/* Villo E & Script */
(function(){
	villo.e = {
		load: function(scriptSrc, villoRoot){
			if(villoRoot == false){
				//Load this up from the main app root.
				$script(scriptSrc);
			}else{
				$script(villo.script.get() + scriptSrc);
			}
		}
	}
	villo.script = {
		get: function(){
			var scripts = document.getElementsByTagName("script");
			for (var i = 0, s, src, l = "villo.js".length; s = scripts[i]; i++) {
				src = s.getAttribute("src") || "";
				if (src.slice(-l) == "villo.js") {
					return src.slice(0, -l - 1) + "/";
				}
			}
		}
	}
})();
