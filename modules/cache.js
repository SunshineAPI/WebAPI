"use strict";
var redis = require("redis");
var crypto = require("crypto");
var config = require("../config");
var url = require("url");

var instance = null;

var exp = {};

exp.getRedis = function() {
	return instance;
};

var connect_redis = function() {
	console.log("Connecting to redis...");


	var redis_env = process.env.REDIS_ENV;
	var redis_url;
	if (redis_env) {
		var redis_raw = process.env[redis_env];
		redis_url = redis_raw ? url.parse(redis_raw) : {};
		redis_url.port = redis_url.port || 6379;
		redis_url.hostname = redis_url.hostname || "localhost";
	} else {
		redis_url = {};
		redis_url.port = config.redis.port;
		redis_url.hostname = config.redis.host;
	}

	instance = redis.createClient(redis_url.port, redis_url.hostname);
	if (redis_url.auth) {
		instance.auth(redis_url.auth.split(":")[1]);
	}

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
	instance.hmset(key, {
		body: JSON.stringify(json),
		status: res.statusCode
	}, function() {
		if (key) {
			var seconds = config.cache_times[timeKey];
			instance.expire(key, seconds);
		}
	});
};

connect_redis();

module.exports = exp;