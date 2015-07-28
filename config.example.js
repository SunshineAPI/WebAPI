"use strict";
var config = {
	user_agent: "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36",    // Specify the user agent to use
	base_url: "https://oc.tc",    // Specify the base URL for API calls
	test_url: "http://sunshineapi.github.io/sunshine-mock.github.io",      // Specify the URL to test against, should remain the same, and should never be Overcast directly
	http_timeout: 3000,   // Specify the HTTP timeout for API requests
	cache_times: {      // Specify how long each module key should be cached for in seconds
		player: 30,
	}
};

module.exports = config;