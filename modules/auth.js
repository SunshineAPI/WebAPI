"use strict";
var redis = require("redis");
var request = require("request");
var crypto = require("crypto");
var instance = null;

var ex = {};

ex.getRedis = function() {
	return instance;
};

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
};

ex.get_hash = function(username, password) {
	return crypto.createHash("md5").update(username + ":" + password).digest("hex");
};

var getCookie = function(username, password, cb) {
	var hash = ex.get_hash(username, password);

	instance.get(hash, function(err, reply) {
		if (err) {
			cb(err, null);
		} else {
			if (reply) {
				cb(null, reply);
			} else {
				requestCookie(username, password, function(err, cookie) {
					cb(err, cookie);
				});
			}
		}
	});
};

var requestCookie = function(username, password, cb) {

	var options = {
		method: "POST",
		url: "https://oc.tc/login",
		headers: {
			"content-type": "multipart/form-data;"
		},
		formData: {
			"user[email]": username,
			"user[password]": password
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
		var cookie = cookies._ProjectAres_sess;

		if (cookie) {
			instance.set(ex.get_hash(username, password), cookie);
		}

		cb(null, cookie);

	});
};

ex.authed_req = function(options, username, password, callback) {
	if (!options.headers) {
		options.headers = {};
	}
	getCookie(username, password, function(error, cookie) {
		if (error) {
			if (error === 401) {
				return callback({status: 401, message: "incorrect credentials"}, null, null);
			} else {
				return callback({status: 500, message: "failed to login"}, null, null);
			}
		}
		options.headers.Cookie = "_ProjectAres_sess=" + cookie;
		request(options, function(error, response, body) {
			if (error) {
				callback({status: 500, message: "failed to make oc.tc API request"}, response, body);
			} else {
				callback(null, response, body);
			}
			
		});
	});
};

function parseCookies(rc) {
	var list = {};

	rc.split(";").forEach(function(cookie) {
		var parts = cookie.split("=");
		list[parts.shift().trim()] = decodeURI(parts.join("="));
	});

	return list;
}


connect_redis();

module.exports = ex;