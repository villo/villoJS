
/* Villo Sync */
(function(){
	//Private function that is run on initialization.
	villo.sync = function(){
		
		/*
		 * Redeem our voucher.
		 */
		//Create voucher date
		var d = new Date();
		var voucherday = d.getDate() + " " + d.getMonth() + " " + d.getFullYear();
		//Get last voucher date
		if (store.get('voucher')) {
			if (voucherday == store.get('voucher')) {
				villo.syncFeed();
			} else {
				//Today is a new day, let's request ours and set the new date.
				store.set('voucher', voucherday);
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
			store.set('voucher', voucherday);
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
	
	}
	villo.syncFeed = function(){
		var currentTime = new Date().getTime();
		if (store.get("feed")) {
			if (currentTime > (store.get("feed") + 1000000)) {
				store.set('feed', currentTime);
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
			store.set('feed', currentTime);
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
	}
})();
