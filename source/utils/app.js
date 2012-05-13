
/*
 * Generic/Private Functions/Housings
 */
villo.app = {
	propBag: {
		"states": null,
		"settings": null
	},
	//Villo.clipboard for copy and paste.
	clipboard: [],
	//All logs from villo.log get dumped here.
	logs: [],
	//A house for the app settings.
	settings: {},
	//Reference to our pubnub api keys:
	pubnub: {
		pub: "pub-42c6b905-6d4e-4896-b74f-c1065ab0dc10",
		sub: "sub-4e37d063-edfa-11df-8f1a-517217f921a4"
	}
};
