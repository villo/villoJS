
//Create the global myGame object using Villo extensions: 
villo.extend(window, {
	myGame: {
		start: function(){
			this.game = new villo.Game({
				name: "myGame",
				type: "all",
				features: ["chat", "data"],
				events: {
					chat: "onChat",
					data: "onData"
				},
				onChat: function(){
					console.log("Hi!");
				},
				onData: function(){
					
				},
				create: function(){
					this.chat.send({
						room: this.chat.room,
						message: "Hello!"
					});
				}
			});
		}
	},
});
