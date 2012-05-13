
/* Villo Sync */
//Private function that is run on initialization.
villo.sync = function(){
	//Create voucher date
	var d = new Date();
	var voucherday = d.getDate() + " " + d.getMonth() + " " + d.getFullYear();
	//Get last voucher date
	if (villo.store.get('voucher')) {
		if (voucherday === villo.store.get('voucher')) {
			villo.syncFeed();
		} else {
			//Today is a new day, let's request ours and set the new date.
			villo.store.set('voucher', voucherday);
			villo.ajax("https://api.villo.me/credits.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					appid: villo.app.id,
					type: "voucher",
					username: villo.user.username,
					token: villo.user.token
				},
				onSuccess: function(){
				},
				onFailure: function(){
				}
			});
		}
	} else {
		//No last voucher date. Set one and request our voucher.
		villo.store.set('voucher', voucherday);
		villo.ajax("https://api.villo.me/credits.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				type: "voucher",
				username: villo.user.username,
				token: villo.user.token
			},
			onSuccess: function(transport){
			},
			onFailure: function(){
			}
		});
	}
};

villo.syncFeed = function(){
	var currentTime = new Date().getTime();
	if (villo.store.get("feed")) {
		if (currentTime > (villo.store.get("feed") + 1000000)) {
			villo.store.set('feed', currentTime);
			villo.ajax("https://api.villo.me/credits.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					appid: villo.app.id,
					type: "launch",
					username: villo.user.username,
					token: villo.user.token
				},
				onSuccess: function(transport){
				},
				onFailure: function(){
				}
			});
		} else {
			//It hasn't been long enough since our last check in.
		}
	} else {
		villo.store.set('feed', currentTime);
		villo.ajax("https://api.villo.me/credits.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				type: "launch",
				username: villo.user.username,
				token: villo.user.token
			},
			onSuccess: function(transport){
			},
			onFailure: function(){
			}
		});
	}
};
