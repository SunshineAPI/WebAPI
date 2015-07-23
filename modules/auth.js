"use strict";
var redis = require("redis");
var request = require("request");
var crypto = require("crypto");
var instance = null;

var exp = {};

exp.getRedis = function() {
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
		console.error("Lost redis connection!");
	});
};

exp.get_hash = function(email, password) {
	return crypto.createHash("md5").update(email + ":" + password).digest("hex");
};

/*
	Hashes the `email` and `password`, and attempts
	to look it up in the redis cache. If not found,
	a request will be made to Overcast to try and
	obtain a new cookie, which may result in a 401
 */
exp.getCookie = function(email, password, cb) {
	var hash = ex.get_hash(email, password);

	instance.get(hash, function(err, reply) {
		if (err) {
			cb(err, null, null);
		} else {
			if (reply) {
				cb(null, reply, hash);
			} else {
				requestCookie(email, password, function(err, cookie, newHash) {
					cb(err, cookie, newHash);
				});
			}
		}
	});
};

exp.getCookieFromHash = function(hash, cb) {
	instance.get(hash, function(err, reply) {
		cb(err, reply);
	});
};

/*
	Make a POST request to Overcast in order to attempt
	to login to the site, and retrieve a session cookie.
 */
var requestCookie = function(email, password, cb) {

	var options = {
		method: "POST",
		url: "https://oc.tc/login",
		headers: {
			"content-type": "multipart/form-data;"
		},
		formData: {
			"user[email]": email,
			"user[password]": password
		}
	};

	request(options, function(error, response, body) {
		var cHeader = response.headers["set-cookie"];
		if (error) {
			return cb(error || response.statusCode, null);
		} else if (body.toString().indexOf("Forgot your password") > -1) {
			return cb(401, null);
		}
		var cookies = parseCookies(cHeader[1]);
		var cookie = cookies._ProjectAres_sess;
		var hash = ex.get_hash(email, password);
		if (cookie) {
			instance.set(hash, cookie);
		}

		cb(null, cookie, hash);

	});
};

/*
	Make an authenticated request to Overcast by
	passing the session cookie which can be accessed
	in the `authorization` hash of an authorized request
 */
exp.authed_req = function(options, cookie, callback) {
	if (!options.headers) {
		options.headers = {};
	}
	options.headers.Cookie = "_ProjectAres_sess=" + cookie;
	request(options, function(error, response, body) {
		if (error) {
			callback({
				status: 500,
				message: "failed to make oc.tc API request"
			}, response, body);
		} else {
			callback(null, response, body);
		}
	});
};

/*
	Parses the cookie header, mostly in order to get the
	session cookie returned by any authenticated request
 */
function parseCookies(rc) {
	var list = {};

	rc.split(";").forEach(function(cookie) {
		var parts = cookie.split("=");
		list[parts.shift().trim()] = decodeURI(parts.join("="));
	});

	return list;
}


/*
	The middleware to authorize API users.
	Will set req.authorized to `true` if
	the request has been authorized by
	or `false` if not. 

	If true, req.authorization is a hash of
	relevant information, including the token
	hash, session cookie, and time until expiry.
 */
exp.authorize = function(req, res, next) {
	var header = req.headers.authorization;
	if (!header) {
		return res.status(403).json({
			errors: ["Provide authentication"]
		});
	}
	if (header.indexOf("Bearer") > -1) {
		header = header.replace("Bearer", "").trim();
		var token = header;

		ex.getCookieFromHash(token, function(err, cookie) {
			if (err || cookie === null) {
				res.status(403).json({
					errors: ["Invalid authentication token"]
				});
			} else {
				req.authorized = true;
				req.authorization = {
					token: token,
					cookie: cookie
				};
				next();
			}
		});
	} else if (header.indexOf("Credentials") > -1) {
		header = header.replace("Credentials", "").trim();
		var split = header.split(":");
		var email = split[0];
		var password = split[1];

		ex.getCookie(email, password, function(err, cookie, hash) {
			if (err && err === 401) {
				res.status(401).json({
					errors: ["Invalid email or password"]
				});
			} else if (err) {
				res.status(500).json({
					errors: ["Failed to authenticate with Overcast"]
				});
			} else {
				req.authorized = true;
				req.authorization = {
					token: hash,
					cookie: cookie
				};
				next();
			}
		});
	} else {
		res.status(403).json({
			errors: ["Provide authentication credentials"]
		});
	}
}


connect_redis();

module.exports = exp;