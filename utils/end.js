
/* Villo Ending File */

//As per the 1.0 plans, we don't load the info.villo.js file automatically, so check for the legacy variable.
if ("VILLO_SETTINGS" in window && VILLO_SETTINGS.USELEGACY === true) {
	villo.verbose && console.log("Using legacy setting, automatically loading info.villo.");
	//Load up info.villo as a javascript file.
	$script(villo.script.get() + "info.villo.js");
}else{
	villo.verbose && console.log("Villo Library Loaded");
}
