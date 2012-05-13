
/* Villo Clipboard */
villo.clipboard = {
/**
	villo.clipboard.copy
	====================
	
    Used to copy a string of text to the villo.app.clipboard object, for retrieval at some point.
    
	Calling
	-------

	`villo.clipboard.copy(string)`

	Returns
	-------
	
	Returns the index of the string within the villo.app.clipboard object.
	
	Use
	---
	
		villo.clipboard.copy("What's up, dawg!?");

*/

	copy: function(string){
		var newIndex = villo.app.clipboard.length;
		villo.app.clipboard[newIndex] = string;
		return newIndex;
	},         
/**
	villo.clipboard.paste
	=====================
	
    Retrieves a string of text that has previously been copied.
    
    Calling
	-------

	`villo.clipboard.paste(index)`
    
    - The "index" argument is optional. If it is not passed, the last text copied will be returned.

	Returns
	-------
	
	Returns the string of text that was previously copied. If no index is defined in the call, then the last string of text copied will be returned.
	
	Use
	---
	
		var oldInput = villo.clipboard.paste();

*/

	paste: function(index){
		if (index) {
			return villo.app.clipboard[index];
		} else {
			var lastIndex = villo.app.clipboard.length;
			return villo.app.clipboard[lastIndex - 1];
		}
	}
};
