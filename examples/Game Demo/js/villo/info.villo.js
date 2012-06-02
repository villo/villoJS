villo.load({
	"id": "me.villo.game.demo",
	"version": "1.0.0",
	"developer": "Villo",
	"type": "desktop",
	"title": "Villo Game Demo",
	"api": "e0adc431916dbd680f12bc37cc18ac80",
	"push": true,
	"verbose": false,
	"include": [
		//By doing this, we turn off all of the caching:
		"js/game.js?" + new Date().getTime()
	]
});