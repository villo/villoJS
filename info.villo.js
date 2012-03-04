/*
	Example Villo Loader:
*/

villo.load({
	"id": "your.app.id",
	"version": "1.0.0",
	"developer": "Your Company",
	"type": "mobile",
	"title": "Your App",
	"api": "YOURAPIKEY",
	"push": true,
	"extensions": [
	],
	"include": [
	],
	
	//Other utility parameters (optional):
	useCookies: false, //Replace localstorage with cookies.
	verbose: false, //Turn on logging.
	patch: true //Include Villo's server patch file.
});