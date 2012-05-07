
/* Villo Gift */

/**
	villo.gift
	==================
	
	As of Villo 1.0.0 Villo's Gift functionality is being rewritten from the ground up to make it easier for developers to use. 
	
	A public release for Villo's Gift functionality is planned for Villo version 1.2.0. 
*/
	
	//Sync them, web interface for adding gifts
villo.gift = {
	retrieve: function(giftObject){
		villo.ajax("https://api.villo.me/gifts.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				type: 'specific',
				category: giftObject.categoryStack
			},
			onSuccess: function(transport){
				villo.log(transport);
				if (transport !== "") {
					var tmprsp = JSON.parse(transport)
					if (tmprsp.gifts) {
						giftObject.callback(tmprsp);
					} else {
						if (transport == 33 || transport == 66 || transport == 99) {
							giftObject.callback(transport);
						} else {
							giftObject.callback(33);
						}
					}
				} else {
					giftObject.callback(99);
				}
			},
			onFailure: function(failure){
				villo.log("failure!");
				giftObject.callback(33);
			}
		});
	},
	//The original shipping version of Villo had a typo. We fix it here.
	getCatagories: function(){
		villo.gift.getCategories(arguments);
	},
	
	getCategories: function(giftObject){
		//Get gifts under a specific category
		villo.ajax("https://api.villo.me/gifts.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				type: 'category'
			},
			onSuccess: function(transport){
				villo.log(transport);
				if (transport !== "") {
					var tmprsp = JSON.parse(transport)
					if (tmprsp.gifts) {
						giftObject.callback(tmprsp);
					} else {
						if (transport == 33 || transport == 66 || transport == 99) {
							giftObject.callback(transport);
						} else {
							giftObject.callback(33);
						}
					}
				} else {
					giftObject.callback(33);
				}
			},
			onFailure: function(failure){
				villo.log("failure!");
				giftObject.callback(33);
			}
		});
	},
	
	buy: function(giftObject){
		//Get gifts under a specific category
		villo.ajax("https://api.villo.me/gifts.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				type: 'buy',
				username: villo.user.username,
				token: villo.user.token,
				buyID: giftObject.giftID
			},
			onSuccess: function(transport){
				villo.log(transport);
				if (transport !== "") {
					var tmprsp = JSON.parse(transport)
					if (tmprsp.gifts) {
						giftObject.callback(tmprsp);
					}
					if (transport == 33 || transport == 66 || transport == 99) {
						giftObject.callback(transport);
					} else {
						giftObject.callback(33);
					}
				} else {
					giftObject.callback(33);
				}
			},
			onFailure: function(failure){
				villo.log("failure!");
				giftObject.callback(33);
			}
		});
	},
	
	credits: function(giftObject){
		villo.log(villo.user.token);
		villo.log("Gettin' it!!");
		//Get gifts under a specific category
		villo.ajax("https://api.villo.me/gifts.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				type: 'checkCredit',
				username: villo.user.username,
				token: villo.user.token
			},
			onSuccess: function(transport){
				villo.log(transport);
				if (transport !== "") {
					var tmprsp = JSON.parse(transport)
					if (tmprsp.gifts) {
						villo.credits = tmprsp.gifts.data;
						giftObject.callback(tmprsp);
					}
					if (transport == 33 || transport == 66 || transport == 99) {
						giftObject.callback(transport);
					} else {
						giftObject.callback(33);
					}
				} else {
					giftObject.callback(33);
				}
			},
			onFailure: function(failure){
				villo.log("failure!");
				giftObject.callback(33);
			}
		});
	},
	
	purchases: function(giftObject){
		//Get gifts under a specific category
		villo.ajax("https://api.villo.me/gifts.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				appid: villo.app.id,
				type: 'purchases',
				username: villo.user.username,
				token: villo.user.token
			},
			onSuccess: function(transport){
				villo.log(transport);
				if (transport !== "") {
					var tmprsp = JSON.parse(transport)
					if (tmprsp.gifts) {
						villo.credits = tmprsp.gifts.data;
						giftObject.callback(tmprsp);
					}
					if (transport == 33 || transport == 66 || transport == 99) {
						giftObject.callback(transport);
					} else {
						giftObject.callback(33);
					}
				} else {
					giftObject.callback(33);
				}
			},
			onFailure: function(failure){
				giftObject.callback(33);
			}
		});
	}
}
