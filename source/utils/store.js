
//Utility functions to access localStorage:
villo.store = (function(){
	//Check to see if localStorage is here for us:
	var ls = typeof(localStorage) !== 'undefined' && localStorage;
	//Generate app-specific localStorage keys:
	var genName = function(name){
		return (name + "." + (villo.app.id || "myapp").toUpperCase());
	};
	return {
		get: function(name){
			name = genName(name);
			if(ls){
				return ls.getItem(name);
			}else{
				if (document.cookie.indexOf(name) === -1){
					return null;
				}
                return ((document.cookie || "").match(
                    RegExp(name+'=([^;]+)')
                )||[])[1] || null;
			}
		},
		set: function(name, value){
			name = genName(name);
			if(ls){
				return ls.setItem(name, value);
			}else{
				document.cookie = name + "=" + value + "; expires=Thu, 1 Aug 2030 20:00:00 UTC; path=/";
			}
		},
		remove: function(name){
			name = genName(name);
			if(ls){
				ls.removeItem(name);
			}else{
				document.cookie = name + "=" + value + "; expires=Thu, 1 Aug 2000 20:00:00 UTC; path=/";
			}
		}
	};
})();