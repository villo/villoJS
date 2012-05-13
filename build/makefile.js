var smoosh = require('smoosh');

//Dir to core files:
var core = "../source/core/";
//Dir to utils files:
var utils = "../source/utils/";
//Dir to dependencies:
var dep = "../source/dependencies/";

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
		"villo": [
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
			utils + "sync.js",
			utils + "end.js",
			//Dependencies (don't run jshint on 3rd-party libraries):
			{src: dep + "lab.js", jshint: false},
			{src: dep + "pubnub.js", jshint: false},
			{src: dep + "store.js", jshint: false}
		]
	}
}).run().build().analyze();

/*
 * TODO: joDoc
 */


//NOTE: the following code can run through all villo files and find the comments and read them line-by line.
//Probably should just get jodoc working though...
/*
var trim = function(string) {
    return string.replace(/^\s*|\s*$/g, '')
}

var	lazy = require("lazy"),
	fs = require("fs");

var documenting = true;
new lazy(fs.createReadStream(core +"chat.js")).lines.forEach(
	function(line){
		//convert buffer to string:
		line = line + "";
		if(documenting === true){
			//Check to see if we want to stop docs:
			if(trim(line) === "ENDCOMMENT"){
				documenting = false;
				console.log("stopping documentation");
				return;
			}
			//Start documenting...
			console.log(line);
		}else if(trim(line) === "/**"){
			documenting = true;
			console.log("starting documentation");
			return;
		}
	}
);
*/
