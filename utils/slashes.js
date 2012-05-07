
/* Villo Slash Control */
//Adds slashes into any string to prevent it from breaking the JS.
villo.addSlashes = function(string){
	string = string.replace(/\\/g, '\\\\');
	string = string.replace(/\'/g, '\\\'');
	string = string.replace(/\"/g, '\\"');
	string = string.replace(/\0/g, '\\0');
	return string;
};
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
};
villo.trim = function(str){
	str = str.replace(/^\s+/, '');
	for (var i = str.length - 1; i >= 0; i--) {
		if (/\S/.test(str.charAt(i))) {
			str = str.substring(0, i + 1);
			break;
		}
	}
	return str;
};
