"use strict";
var request = require("request");
var config = require("../config");

var exp = {};

exp.request = function(options, callback) {
	if (typeof options !== "string") {
		options.url = config.base_url + options.url;
	} else {
		var url = options;
		options = {};
		options.url = url;
	}
	if (!options.headers) {
		options.headers = {};
	}
	options.timeout = config.http_timeout;
	options.headers["User-Agent"] = config.user_agent;
	request(options, function(error, response, body) {
		callback(error, response, body);
	});
};

module.exports = exp;