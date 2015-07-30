"use strict";
var config = {
	user_agent: "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36",    // Specify the user agent to use
	base_url: "https://oc.tc",    // Specify the base URL for API calls
	test_url: "http://sunshineapi.github.io/sunshine-mock.github.io",      // Specify the URL to test against, should remain the same, and should never be Overcast directly
	http_timeout: 3000,   // Specify the HTTP timeout for API requests
	cache_times: {      // Specify how long each module key should be cached for in seconds
		player: 30,
		channels: 60 * 5,
		forums_new: 20,
		categories: 60 * 60 * 2,
		category: 20,
		topic: 20,
		post: 30,
		maps_playing: 45,
		maps_all: 60 * 30,
		map: 60 * 30,
		gamemode: 60 * 60,
		match: 60,
		rotations: 60 * 30,
		rotation: 60 * 15,
		region: 60 * 30,
		punishments: 60,
		punishment: 60 * 5,
		staff: 60 * 60,
		stats: 60 * 15,
		teams: 60 * 60,
		team: 60 * 60,
		tournaments: 60 * 60 * 6,
		tournament: 60 * 30
	},
	redis: {
		host: "localhost",
		port: 6379
	}
};

module.exports = config;