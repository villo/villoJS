villo.load({
	"id": "me.villo.docs",
	"version": "1.0.0",
	"developer": "Villo",
	"type": "all",
	"title": "Villo Docs",
	"api": "",
	"verbose": false,
	"include": [
		//Markdown parser:
		"js/showdown.js",
		//Documentor:
		"js/docs.js?" + new Date().getTime()
	]
});