"use strict";
var redis = require("redis");
var crypto = require("crypto");
var config = require("../config");

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

exp.cache = function(key, value) {
	instance.set(key, value);
};

exp.cache_response = function(res, json, timeKey) {
	var key = crypto.createHash("md5").update(res.req.originalUrl).digest("hex");
	instance.hmset(key, {body: JSON.stringify(json), status: res.statusCode}, function() {
		if (key) {
			var seconds = config.cache_times[timeKey];
			instance.expire(key, seconds);
		}
	});
};

connect_redis();

module.exports = exp;