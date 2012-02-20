var extender = {
	login: function(strapObject){
		store.set("token.user", strapObject.username);
		store.set("token.token", strapObject.token);
		villo.user.username = strapObject.username;
		villo.user.token = strapObject.token;
		villo.sync();
	}
}

villo.extend({
	id: "custom",
	signed: false,
	name: "strap",
	js: extender
});