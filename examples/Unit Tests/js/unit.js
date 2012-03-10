villo.extend({
	tests: {
		init: function(){
			//Load all tests:
			this.user.init();
			this.chat.init();
		},
		user: {
			/*
			 * Tests for villo.user functions:
			 */
			init: function(){
				module("User");
				this.login();
			},
			login: function(){
				test("login test", function(){
					stop();
					villo.user.login({
						username: "asdf",
						password: "asdf",
						callback: function(trans){
							start();
							equal(true, trans, "We expect true to be returned.");
						}
					});
				});
				this.isLoggedIn();
			},
			isLoggedIn: function(){
				test("isLoggedIn test", function(){
					equal(true, villo.user.isLoggedIn(), "We expect true to be returned.");
				});
				this.getUsername();
			},
			getUsername: function(){
				test("getUsername test", function(){
					equal(villo.user.username || false, villo.user.getUsername(), "We expect the username to be returned.")
				});
				this.register();
			},
			register: function(){
				test("register test", function(){
					stop();
					villo.user.register({
						username: "DELETEME:UNIT-TEST-USER",
						password: "",
						email: "",
						callback: function(trans){
							start();
							equal(true, trans, "We expect true to be returned.");
						}
					});
				});
				this.logout();
			},
			logout: function(){
				test("logout test", function(){
					var logout = villo.user.logout();
					equal(true, logout, "We expect true to be returned.")
				});
			},
		},
		chat: {
			/*
			 * Tests for villo.chat functions:
			 */
			init: function(){
				module("Chat");
				this.join();
			},
			join: function(){
				var room = "villoUnitTest" + Math.floor(Math.random() * 2000);
				test("chat join test", function(){
					var chat = villo.chat.join({
						room: room,
						callback: function(){}
					});
					equal(true, chat, "We expect true to be returned.");
				});
				this.send();
			},
			send: function(){
				var room = "villoUnitTestChat" + Math.floor(Math.random() * 2000);
				test("chat send test", function(){
					stop();
					villo.chat.join({
						room: room,
						callback: function(trans){
							start();
							equal(villo.user.username, trans.username, "We expect the user's username.");
							equal("If you get this string of text, then it worked!", trans.message, "We expect a specific string of text.");
						},
						connect: function(){
							villo.chat.send({
								room: room,
								message: "If you get this string of text, then it worked!"
							});
						}
					});
				});
			},
			end: function(){
				villo.chat.leaveAll();
			}
		}
	},
	init: function(){
		this.tests.init();
	}
});
