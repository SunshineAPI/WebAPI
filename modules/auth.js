var redis = require("redis");
var request = require("request");
var crypto = require("crypto");
var instance = null;

var ex = {};

ex.getRedis = function() {
	return instance;
}

var connect_redis = function() {
	console.log("Connecting to redis...");

	instance = redis.createClient(6379, "localhost");

	instance.on("ready", function() {
		console.log("Established redis connection.");
	});

	instance.on("error", function(err) {
		console.error(err);
	});

	instance.on("end", function() {
		console.warn("Lost redis connection!");
	});
}

ex.get_hash = function(username, password) {
	return crypto.createHash('md5').update(username + ":" + password).digest('hex');
}

ex.get_cookie = function(username, password, cb) {
	var hash = ex.get_hash(username, password);

	instance.get(hash, function(err, reply) {
		if (err) {
			cb(err, null);
		} else {
			cb(null, reply);
		}
	});
}

ex.request_cookie = function(username, password, cb) {

	var options = {
		method: 'POST',
		url: 'https://oc.tc/login',
		headers: {
			'content-type': 'multipart/form-data;'
		},
		formData: {
			'user[email]': username,
			'user[password]': password
		}
	};

	request(options, function(error, response, body) {
		var cHeader = response.headers["set-cookie"];
		if (error) {
			return cb(error || response.stausCode, null);
		} else if (body.toString().indexOf("Forgot your password") > -1) {
			return cb(401, null);
		}
		var cookies = parseCookies(cHeader[1]);
		var cookie = cookies["_ProjectAres_sess"];
		
		if (cookie) {
			instance.set(ex.get_hash(username, password), cookie);
		}

		cb(null, cookie);

	});

}

function parseCookies(rc) {
	var list = {};

	rc && rc.split(';').forEach(function(cookie) {
		var parts = cookie.split('=');
		list[parts.shift().trim()] = decodeURI(parts.join('='));
	});

	return list;
}


connect_redis()

module.exports = ex;