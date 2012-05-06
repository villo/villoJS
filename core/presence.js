
/* Presence */
(function(){
	villo.extend({
		presence: {
			join: function(joinObject){
				//Check for socket:
				if("io" in window){
					var socket = io.connect('http://pubsub.pubnub.com');
					  socket.on( 'news', function (data) {
					    console.log(data);
					  } );
				}else{
					console.log("Socket is not functional");
				}
			}
		}
	});
})();
