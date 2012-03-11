/*
 * Utility Bind Function:
 * 
 * Not included in Villo by default.
 */
villo.extend({
	bind: function(scope, _function) {
		return function() {
			return _function.apply(scope, arguments);
		}
	}
});
/*
 * Unit Testing Extension:
 */
villo.extend({
	tests: {
		init: function(){
			//Add super class references:
			for(var x in this){
				if(this.hasOwnProperty(x)){
					this[x].__class__ = this;
				}
			}
			//Load first set of tests (user):
			this.user.init();
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
				test("login test", villo.bind(this, function(){
					stop();
					villo.user.login({
						username: "asdf",
						password: "asdf",
						callback: villo.bind(this, function(trans){
							start();
							equal(trans, true, "We expect true to be returned.");
							this.isLoggedIn();
						})
					});
				}));
			},
			isLoggedIn: function(){
				test("isLoggedIn test", function(){
					equal(villo.user.isLoggedIn(), true, "We expect true to be returned.");
				});
				this.getUsername();
			},
			getUsername: function(){
				test("getUsername test", function(){
					equal(villo.user.getUsername(), villo.user.username || false, "We expect the username to be returned.")
				});
				this.register();
			},
			register: function(){
				test("register test", villo.bind(this, function(){
					stop();
					villo.user.register({
						username: "DELETEME:UNIT-TEST-USER",
						password: "",
						email: "",
						callback: villo.bind(this, function(trans){
							start();
							equal(trans, true, "We expect true to be returned.");
							this.logout();
						})
					});
				}));
			},
			logout: function(){
				test("logout test", function(){
					var logout = villo.user.logout();
					equal(logout, true, "We expect true to be returned.")
				});
				this.end();
			},
			end: function(){
				//Load up the chat tests:
				this.__class__.chat.init();
			}
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
				test("join test", function(){
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
				this.sendRoom = room;
				test("send test", villo.bind(this, function(){
					stop();
					villo.chat.join({
						room: room,
						callback: villo.bind(this, function(trans){
							start();
							equal(trans.username, villo.user.username, "We expect the user's username.");
							equal(trans.message, "If you get this string of text, then it worked!", "We expect a specific string of text.");
							this.isSubscribed();
						}),
						connect: function(){
							villo.chat.send({
								room: room,
								message: "If you get this string of text, then it worked!"
							});
						}
					});
				}));
			},
			isSubscribed: function(){
				var room = "villoUnitTestSubscribed" + Math.floor(Math.random() * 2000);
				test("isSubscribed test", villo.bind(this,function(){
					stop();
					villo.chat.join({
						room: room,
						callback: function(trans){
						},
						connect: villo.bind(this, function(){
							start();
							equal(villo.chat.isSubscribed(room), true, "We expect true to be returned.");
							this.history();
						})
					});
				}));
			},
			history: function(){
				//We know that something was sent to this room:
				var room = "villoUnitTestHistory" + Math.floor(Math.random() * 2000);;
				test("history test", villo.bind(this, function(){
					stop();
					villo.chat.history({
						room: room,
						callback: villo.bind(this, function(t){
							start();
							equal(typeof(t), "object", "We expect an object to be returned");
							this.leave();
						})
					});
				}));
			},
			leave: function(){
				var room = "villoUnitTestLeave" + Math.floor(Math.random() * 2000);;
				test("leave test", villo.bind(this, function(){
					stop();
					villo.chat.join({
						room: room,
						callback: function(){},
						connect: villo.bind(this, function(){
							start();
							//TODO: Should leave really accept a string, and not an object?
							var leave = villo.chat.leave(room);
							equal(leave, true, "We expect the connection to the room to be closed.");
							this.leaveAll();
						})
					});
				}));
			},
			leaveAll: function(){
				test("leaveAll test", villo.bind(this, function(){
					var leave = villo.chat.leaveAll();
					equal(leave, true, "We expect all of the connections to be closed.");
					this.end();
				}));
			},
			end: function(){
				//Load next test (profile):
				this.__class__.profile.init();
			}
		},
		profile: {
			init: function(){
				module("Profile");
				this.get();
			},
			get: function(){
				test("get test", villo.bind(this, function(){
					stop();
					villo.user.login({
						username: "asdf",
						password: "asdf",
						callback: villo.bind(this, function(t){
							equal(t, true, "We expect the user to login.");
							if(t === true){
								villo.profile.get({
									username: "admin",
									callback: villo.bind(this, function(p){
										start();
										equal(p.profile[0].username, "admin", "We expect the correct profile to be returned.");
										this.set();
									})
								})
							}
						})
					});
				}))
			},
			set: function(){
				//Called right out of get, so we can assume we're logged in:
				test("set test", villo.bind(this, function(){
					stop();
					villo.profile.set({
						field: "status",
						data: "I'm sexy and I know it.",
						callback: villo.bind(this, function(p){
							start();
							equal(p.profile[0].status, "I'm sexy and I know it.", "We expect the field to be updated with a specific string.");
							this.friends();
						})
					});
				}));
			},
			friends: function(){
				test("friends test", function(){
					stop();
					villo.profile.friends({
						callback: function(f){
							start();
							equal(typeof(f.friends), "object", "We expect A friends object.");
						}
					});
				});
			}
		}
	},
	init: function(){
		this.tests.init();
	}
});
