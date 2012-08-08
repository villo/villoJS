
//Private function that is run on initialization.
villo.sync = function(){
	console.log("Sync...");
	//Create voucher date
	var d = new Date();
	
	var setVoucher = function(serverq){
		console.log("Setting voucher...");
		villo.store.set('voucher', d.toString());
		if(!serverq){
			console.log("Posting to server...");
			villo.ajax("https://api.villo.me/credits.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					appid: villo.app.id,
					type: "voucher",
					username: villo.user.username,
					token: villo.user.token
				},
				onSuccess: function(){},
				onFailure: function(){}
			});
		}
	};
	
	//Get voucher:
	var voucher = villo.store.get('voucher');
	if(voucher){
		if(new Date(voucher).getDate() !== d.getDate()){
			console.log("new day, posting date!...");
			setVoucher();
		}
		//We'll post a launch update every two hours:
		else if(d.getTime() > (new Date(voucher).getTime() + 7200000)){
			console.log("Feed update...");
			setVoucher(false);
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
	}else{
		console.log("voucher never set...");
		setVoucher();
	}
};