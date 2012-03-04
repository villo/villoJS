
/* Villo Slash Control */
(function(){
	//Adds slashes into any string to prevent it from breaking the JS.
	villo.addSlashes = function(string){
		string = string.replace(/\\/g, '\\\\');
		string = string.replace(/\'/g, '\\\'');
		string = string.replace(/\"/g, '\\"');
		string = string.replace(/\0/g, '\\0');
		return string;
	},
	villo.stripslashes = function(str){
		return (str + '').replace(/\\(.?)/g, function(s, n1){
			switch (n1) {
				case '\\':
					return '\\';
				case '0':
					return '\u0000';
				case '':
					return '';
				default:
					return n1;
			}
		});
	}
})();
