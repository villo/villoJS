
/** MODULE
	name:Leader Boards
*/
villo.leaders = {		
/**
	villo.leaders.get
	=================
	
    Get the top scores in your app, based on durations. As of 0.8.5, you can use multiple leader boards per app. You can also specify how many records you want to retrieve, to increase performance.
    
    Calling
	-------

	`villo.leaders.get({duration: string, board: string, callback: function, limit: number})`
    
    - "Duration" is the time frame you want to load the scores from. Possible durations include "all", "year", "month", "day", and "latest".
    - "Board"  is an optional parameter that lets you specify what leaderboard you wish to grab scores from in your application.
    - "Callback" is a function that is called when the retrieval of scores from the server is completed. The scores object is passed to the callback.
    - "Limit" is an optional parameter that lets you limit the number of scores retrieved from the database, for performance reasons. If the parameter is not passed, a value of 30 will be used by default.

	Callback
	--------
	
	An object will be passed to the callback. The object will be formatted like this, where data is the score submitted:
	
		{"leaders":[
			{"username":"kesne","data":"203","date":"2011-06-24"},
			{"username":"kesne","data":"193","date":"2011-06-13"},
			{"username":"admin","data":"110","date":"2011-06-13"},
		]}
	
	Use
	---
	
		villo.leaders.get({
			duration: "all",
			callback: function(leaderboard){
				//Check for errors.
				if(leaderboard && leaderboard.leaders){
					var leaders = leaderboard.leaders;
					//Now you can do something with the leaderboard array, stored in the leaders array.
				}else{
					//Some error occured.
					alert("Error getting leaderboards.");
				}
			},
			limit: 50
		});

*/
	get: function(getObject){
		var leaderBoardName = "";
		if (getObject.board && getObject.board !== "") {
			leaderBoardName = getObject.board;
		} else {
			leaderBoardName = villo.app.title;
		}
		
		var leaderLimiter = 30;
		if(getObject.limit && getObject.limit !== "" && typeof(getObject.limit) === "number"){
			leaderLimiter = getObject.limit;
		}
		
		villo.ajax("https://api.villo.me/leaders.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				type: getObject.duration,
				username: villo.user.username,
				appName: leaderBoardName,
				appid: villo.app.id,
				limit: leaderLimiter
			},
			onSuccess: function(transport){
				villo.verbose && villo.log("Success!");
				villo.verbose && villo.log(transport);
				if (transport !== "") {
					var tmprsp = JSON.parse(transport);
					if (tmprsp.leaders) {
						getObject.callback(tmprsp);
					} else 
						if (transport === 33 || transport === 66 || transport === 99) {
							getObject.callback(transport);
						} else {
							getObject.callback(33);
						}
				} else {
					getObject.callback(33);
				}
			},
			onFailure: function(failure){
				villo.verbose && villo.log("failure!");
				getObject.callback(33);
			}
		});
	},
/**
	villo.leaders.search
	====================
	
    Search the leaderboard records for a user's scores. The username can be partial, or complete. All username matches will be retrieved. You can also specify how many records you want to retrieve, to increase performance.
    
    Calling
	-------

	`villo.leaders.search({username: string, board: string, callback: function, limit: number})`
    
    - "Username" is the full or partial username you want to get the scores for.
    - "Board"  is an optional parameter that lets you specify what leaderboard you wish to grab scores from in your application.
    - "Callback" is a function that is called when the retrieval of the user's scores from the server is completed. The scores object is passed to the callback.
    - "Limit" is an optional parameter that lets you limit the number of scores retrieved from the database, for performance reasons. If the parameter is not passed, a value of 30 will be used by default.

	Callback
	--------
	
	An object will be passed to the callback. The object will be formatted like this, where data is the score submitted:
	
		{"leaders":[
			{"username":"noah","data":"243","date":"2011-06-24"},
			{"username":"noah","data":"200","date":"2011-06-24"},
			{"username":"noahtest","data":"178","date":"2011-06-13"},
			{"username":"noahtest2","data":"93","date":"2011-06-13"},
		]}
	
	Use
	---
	
		villo.leaders.search({
			username: this.$.scoreSearch.getValue(),
			callback: function(leaderboard){
				//Check for errors.
				if(leaderboard && leaderboard.leaders){
					var leaders = leaderboard.leaders;
					//Now you can do something with the leaderboard array, stored in the leaders array.
				}else{
					//Some error occured.
					alert("Error getting leaderboards.");
				}
			},
			limit: 50
		});

*/
	search: function(getObject){
		var leaderBoardName = villo.app.title;
		if (getObject.board && getObject.board !== "") {
			leaderBoardName = getObject.board;
		}
		
		var leaderLimiter = 30;
		if(getObject.limit && getObject.limit !== "" && typeof(getObject.limit) === "number"){
			leaderLimiter = getObject.limit;
		}
		
		villo.ajax("https://api.villo.me/leaders.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				type: "search",
				username: villo.user.username,
				appName: leaderBoardName,
				appid: villo.app.id,
				usersearch: getObject.username,
				limit: leaderLimiter
			},
			onSuccess: function(transport){
				villo.verbose && villo.log("Success!");
				villo.verbose && villo.log(transport);
				if (transport !== "") {
					var tmprsp = JSON.parse(transport);
					if (tmprsp.leaders) {
						getObject.callback(tmprsp);
					} else 
						if (transport === 33 || transport === 66 || transport === 99) {
							getObject.callback(transport);
						} else {
							getObject.callback(33);
						}
				} else {
					getObject.callback(33);
				}
			},
			onFailure: function(failure){
				villo.verbose && villo.log("failure!");
				getObject.callback(33);
			}
		});
	},
/**
	villo.leaders.submit
	====================
	
    Submit a given (numerical) score to a leaderboard.
    
    Calling
	-------

	`villo.leaders.submit({score: string, board: string, callback: function})`
    
    - The "score" is the numerical score that you wish to submit.
    - "Board"  is an optional parameter that lets you specify what leaderboard you wish to submit the score to. If you specify a board while submitting, then the scores will only be visible if you call villo.leaders.get for the same board name.
    - "Callback" is a function that is called when the score is submitted.

	Callback
	--------
	
	If the score was submitted successfully, true will be passed to the callback.
	
	Use
	---
	
		var theScore = 100;
		villo.leaders.submit({
			score: theScore,
			callback: function(didIDoIt){
				//Check for errors.
				if(didIDoIt === true){
					//Submitted score!
					alert("Score was submitted!");
				}else{
					//Some error occured.
					alert("Error submitting score.");
				}
			}
		});

*/
	submit: function(scoreObject){
		var leaderBoardName = villo.app.title;
		if (scoreObject.board && scoreObject.board !== "") {
			leaderBoardName = scoreObject.board;
		}
		
		var leaderBoardUsername = villo.user.username;
		if (villo.user.username === "" || !villo.user.username || (scoreObject.anon && scoreObject.anon === true)) {
			leaderBoardUsername = "Guest";
		}
		
		villo.ajax("https://api.villo.me/leaders.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				type: "submit",
				username: leaderBoardUsername,
				token: villo.user.token,
				appName: leaderBoardName,
				appid: villo.app.id,
				score: scoreObject.score
			},
			onSuccess: function(transport){
				villo.verbose && villo.log(transport);
				if (transport !== "") {
					if (transport === "0") {
						//Submitted!
						scoreObject.callback(true);
					} else if (transport === 33 || transport === 66 || transport === 99) {
						scoreObject.callback(transport);
					} else {
						scoreObject.callback(33);
					}
				} else {
					scoreObject.callback(33);
				}
			},
			onFailure: function(failure){
				villo.verbose && villo.log("failure!");
				scoreObject.callback(33);
			}
		});
	}
};
