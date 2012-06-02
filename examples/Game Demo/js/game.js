
//Create the global myGame object using Villo extensions: 
villo.extend(window, {
	myGame: {
		start: function(){
			this.game = new villo.Game({
				name: "myGame",
				type: "all"
			});
		}
	},
});
