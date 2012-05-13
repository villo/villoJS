
/*
 * Unit Testing Extension:
 */
villo.extend(villo, {
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
						password: "test",
						email: "test@test.com",
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
				test("friends test", villo.bind(this, function(){
					stop();
					villo.profile.friends({
						callback: villo.bind(this, function(f){
							start();
							equal(typeof(f.friends), "object", "We expect a friends object.");
							this.end();
						})
					});
				}));
			},
			end: function(){
				this.__class__.clipboard.init();
			}
		},
		clipboard: {
			init: function(){
				module("Clipboard");
				this.copy();
			},
			copy: function(){
				test("copy test", villo.bind(this, function(){
					var copy = villo.clipboard.copy("What's up, dawg!?");
					equal(typeof(copy), "number", "We expect a number to be returned.");
					this.paste();
				}));
			},
			paste: function(){
				test("paste test", villo.bind(this, function(){
					var paste = villo.clipboard.paste();
					equal(paste, "What's up, dawg!?", "We expect a specific string.")
					this.end();
				}));
			},
			end: function(){
				this.__class__.friends.init();
			}
		},
		friends: {
			init: function(){
				module("Friends");
				this.add();
			},
			add: function(){
				test("add test", villo.bind(this, function(){
					stop();
					villo.friends.add({
						username: "admin",
						callback: villo.bind(this, function(f){
							var added = false;
							for(var x in f.friends){
								if(f.friends.hasOwnProperty(x)){
									if(f.friends[x].toLowerCase() === "admin"){
										added = true;
									}
								}
							}
							start();
							equal(added, true, "We expect the user to be in the friendlist.");
							this.get();
						})
					});
				}));
			},
			get: function(){
				test("get test", villo.bind(this, function(){
					stop();
					villo.friends.get({
						callback: villo.bind(this, function(f){
							start();
							equal(typeof(f), "object", "We expect the user to be in the friendlist.");
							this.remove();
						})
					});
				}));
			},
			remove: function(){
				test("remove test", villo.bind(this, function(){
					stop();
					villo.friends.remove({
						username: "admin",
						callback: villo.bind(this, function(f){
							var added = false;
							for(var x in f.friends){
								if(f.friends.hasOwnProperty(x)){
									if(f.friends[x].toLowerCase() === "admin"){
										added = true;
									}
								}
							}
							start();
							equal(added, false, "We expect the user to be gone.");
							this.end();
						})
					});
				}));
			},
			end: function(){
				this.__class__.resource.init();
			}
		},
		resource: {
			init: function(){
				module("Resource");
				this.resource();
			},
			resource: function(){
				test("resource test", villo.bind(this, function(){
					equal((villo.example || false), false, "We expect the resource to not be loaded yet.");
					stop();
					villo.resource({
						resources: [
							"js/villo/example.js"
						],
						callback: villo.bind(this, function(){
							start();
							equal((villo.example || false), true, "We expect the resource to be loaded.");
							this.load();
						})
					});
				}));
			},
			load: function(){
				test("resource via load test", villo.bind(this, function(){
					equal((villo.example2 || false), false, "We expect the resource to not be loaded yet.");
					stop();
					villo.load({
						resources: [
							"js/villo/example2.js"
						],
						callback: villo.bind(this, function(){
							start();
							equal((villo.example2 || false), true, "We expect the resource to be loaded.");
							this.end();
						})
					});
				}));
			},
			end: function(){
				this.__class__.patch.init();
			}
		},
		patch: {
			init: function(){
				module("Patch");
				test("remote patch file test", villo.bind(this, function(){
					stop();
					villo.hooks.listen({
						name: "patch",
						retroactive: true,
						callback: villo.bind(this, function(){
							start();
							equal((villo.patched || false), true, "We expect Villo to be patched.")
							this.end();
						})
					});
				}));
			},
			end: function(){
				this.__class__.leaders.init();
			}
		},
		leaders: {
			init: function(){
				
			},
			submit: function(){
				
			},
			get: function(){
				
			},
			search: function(){
				
			},
			end: function(){
				this.__class__.utilities.init();
			}
		},
		messages: {},
		storage: {
			end: function(){
				this.__class__.settings.init();
			}
		},
		settings: {
			end: function(){
				this.__class__.states.init();
			}
		},
		states: {},
		utilities: {
			init: function(){
				module("Utilities");
				this.ajax();
			},
			ajax: function(){
				test("ajax test", villo.bind(this, function(){
					stop();
					villo.ajax("https://api.villo.me/ping.php", {
						method: "get",
						onSuccess: villo.bind(this, function(t){
							start();
							equal(t, "Hello, world!", "We expect a specific string to be returned by the server.");
							this.extend();
						}),
						onFailure: villo.bind(this, function(t){
							start();
							ok(false);
							this.extend();
						})
					});
				}));
			},
			extend: function(){
				test("extend test", villo.bind(this, function(){
					villo.extend(villo, {
						extender: {
							working: true
						}
					});
					equal(villo.extender.working, true, "We expect the extension to load.");
					
					villo.extend(villo.extender, {
						notWorking: false
					});
					equal(villo.extender.working, true, "We expect the second sub-extension to load.");
					
					villo.extend(villo.extender, {
						init: function(){
							this.initRun = true;
						}
					});
					equal(villo.extender.initRun, true, "We expect the init function to be run.");
					
					this.log();
				}));
			},
			log: function(){
				test("log test", villo.bind(this, function(){
					var log = villo.log("Hello there!");
					equal(log, true, "We expect the content to be logged.");
					this.webLog();
				}));
			},
			webLog: function(){
				test("webLog test", villo.bind(this, function(){
					var log = villo.webLog("What's up?");
					equal(log, true, "We expect the content to be logged.");
					this.dumpLogs();
				}));
			},
			dumpLogs: function(){
				//The logs that we put in:
				test("dumpLogs test", villo.bind(this, function(){
					var expectedLogs = [
						"\"Hello there!\"",
						"\"What's up?\""
					];
					deepEqual(villo.dumpLogs(true), expectedLogs, "We expect to get the logs we've generated previously.")
				}));
			}
		}
	},
	init: function(){
		this.tests.init();
	}
});
