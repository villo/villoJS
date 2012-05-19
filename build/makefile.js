var smoosh = require('smoosh');

//Dir to core files:
var core = "../source/core/";
//Dir to utils files:
var utils = "../source/utils/";
//Dir to dependencies:
var dep = "../source/dependencies/";

var files = [
	//Core:
	core + "core.js",
	core + "analytics.js",
	core + "bridge.js",
	core + "chat.js",
	core + "clipboard.js",
	core + "feeds.js",
	core + "friends.js",
	core + "game.js",
	core + "gift.js",
	core + "init.js",
	core + "leaders.js",
	core + "messages.js",
	core + "presence.js",
	core + "profile.js",
	core + "settings.js",
	core + "states.js",
	core + "storage.js",
	core + "user.js",
	//Utils:
	utils + "ajax.js",
	utils + "app.js",
	utils + "do.js",
	utils + "extend.js",
	utils + "hooks.js",
	utils + "lang.js",
	utils + "log.js",
	utils + "store.js",
	utils + "sync.js",
	utils + "end.js",
	//Dependencies: 
	{src: dep + "lab.js", jshint: false}, 
	{src: dep + "pubnub.js", jshint: false}
]

smoosh.config({
	"JSHINT_OPTS": {
		"browser": true,
		"devel": true,
		"strict": false,
		"forin": true,
		"noarg": true,
		"eqeqeq": true,
		"bitwise": true,
		"undef": false,
		"curly": true
	},
	"JAVASCRIPT": {
		"DIST_DIR": "../",
		"villo": files
	}
}).run().build().analyze();
