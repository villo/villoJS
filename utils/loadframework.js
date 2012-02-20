/* 
 * Villo Framework Loader
 * This shouldn't be used any longer. We've built in the framework loader to the villo.load function.
 */
(function(){
	villo.loadFramework = function(frameworkName, options){
		if (frameworkName == "pubnub") {
			
			if(options.pub && options.pub !== ""){
				
			}else{
				options.pub = "pub-42c6b905-6d4e-4896-b74f-c1065ab0dc10";
			}
			
			if(options.sub && options.sub !== ""){
				
			}else{
				options.sub = "sub-4e37d063-edfa-11df-8f1a-517217f921a4";
			}
			
			var connect = document.createElement('script'), attr = '', attrs = {
				'pub-key': options.pub,
				'sub-key': options.sub,
				'id': 'comet-connect',
				'src': 'http://cdn.pubnub.com/pubnub-3.1.min.js',
				'origin': 'pubsub.pubnub.com'
			};
			for (attr in attrs) {
				connect.setAttribute(attr, attrs[attr]);
			}
			document.getElementsByTagName('head')[0].appendChild(connect);
			
			villo.pubby({
				callback: function(PUBNUB){
					villo.log("PubNub loaded, Push is ready.");
					villo.pushFramework = "pubnub";
				}
			});
			
		}
	}
	villo.pubby = function(readyFunction){
		if ('PUBNUB' in window) {
			readyFunction.callback(PUBNUB);
		} else {
			setTimeout(function(){
				villo.pubby(readyFunction)
			}, 100);
		}
	}
})();
