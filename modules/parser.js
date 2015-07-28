"use strict";
var cheerio = require("cheerio"),
	Topic = require("../modules/topic"),
	url = require("url"),
	querystring = require("querystring"),
	config = require("../config.example"),
	helpers = require("./helpers");

var exp = {};

exp.parseProfile = function(name, cb) {
	var options = {
		url: "/stats/" + name,
		followAllRedirects: true
	};

	helpers.request(options, function(error, response, body) {
		if (error || response.statusCode !== 200) {
			return cb(null, 404);
		}
		var player = {};
		var profile = {};
		var $ = cheerio.load(body);

		// Get Name
		player.username = $("h1 span").first().text().trim();
		var formerUser = $("h1 small");
		var previous = null;
		if (formerUser.length) {
			player.previous_username = formerUser.first().text().replace(/\(|\)|formerly/gi, "").trim();
		}
		player.previous_username = previous;

		// Get Status
		var status;
		if ($("body > div > section:nth-child(2) > div.row > div.span3 > div").text() !== "") {
			status = $("body > div > section:nth-child(2) > div.row > div.span3 > div").text();
		} else if ($("body > div > section:nth-child(2) > div.row > div.span3 > span:nth-child(3)").children().length === 0) {
			var spanthree = $("body > div > section:nth-child(2) > div.row > div.span3 > strong").text();
			status = "Seen " + spanthree + " ago";
		} else {
			var spthree = $("body > div > section:nth-child(2) > div.row > div.span3 > strong").text();
			status = "Seen " + spthree + " ago on " + $("body > div > section:nth-child(2) > div.row > div.span3 > span:nth-child(3) > a").text();
		}
		status = status.escapeSpecialChars();
		player.status = status;

		// Get Social Links
		profile.social = {};
		$("#about > div.row:nth-child(1) > .span4").each(function() {
			if ($(this).children("h6").text() == "Team") {
				profile.team = {};
				profile.team.name = $(this).children("blockquote").text().escapeSpecialChars();
				profile.team.id = $(this).find("a").attr("href").replace("/teams/", "");
			} else {
				profile.social[$(this).children("h6").text().toLowerCase()] = $(this).children("blockquote").children("p").text().escapeSpecialChars();
			}
		});

		var etcNodes = $("#about > div.row:nth-child(2) > .span6");
		etcNodes.each(function() {
			var elem = $(this);
			var title = elem.find("h6").text().toLowerCase();
			var text = elem.find("pre").text();
			profile[title] = text;
		});

		// Get Bio
		profile.bio = $("#about > div:nth-child(3) > div > pre").text();

		player.profile = profile;

		// Get Friends
		player.friends = {};
		var friendsParent = $("body > div > section:nth-child(2) > div.row > div.span2");
		player.friends.count = parseInt(friendsParent.find("> h2").text().escapeSpecialChars().replace("friends", ""));

		var friends = [];
		var friendNodes = friendsParent.find("a img");
		friendNodes.each(function() {
			friends.push($(this).attr("alt"));
		});
		player.friends.sample = friends;

		var ranks = [];
		$(".label").each(function() {
			var rank = {};
			rank.name = $(this).text();
			rank.background = $(this).css("background-color");
			rank.text = $(this).css("color");
			ranks.push(rank);
		});
		player.ranks = ranks;

		var trophies = [];
		var trophyParent = $(".thumbnails").first();
		trophyParent.children("li").each(function() {
			var thumb = $(this).children(".thumbnail.trophy");
			var t = {
				name: thumb.find("h4").text(),
				description: thumb.attr("title"),
				icon: thumb.find("i").attr("class").match(/fa-[a-z]*/)[0]
			};
			trophies.push(t);
		});
		player.trophies = trophies;

		var stats = {};

		var statsNodes = $("#stats > div");
		var forums = {};
		var forumsNode = $(statsNodes[0]);
		forums.posts = parseInt(getText($(forumsNode.find("h3")[0])));
		forums.topics = parseInt(getText($(forumsNode.find("h3")[1])));
		stats.forums = forums;

		var overall = {};
		var overallNode = $("section:nth-child(2) > div.row");
		overall.kills = parseInt(getText(overallNode.find(".span5 h2")));
		overall.deaths = parseInt(getText(overallNode.find(".span4 h2")));
		overall.kd = parseFloat(getText(overallNode.find(".span3 h2:nth-child(4)")));
		overall.kk = parseFloat(getText(overallNode.find(".span3 h2:nth-child(5)")));
		overall.joins = parseInt(getText(overallNode.find(".span3 h2:nth-child(6)")));
		overall.joined = overallNode.find(".span3 h2:nth-child(6)").attr("title")
			.replace("First joined on", "").trim();
		overall.played = parseFloat(getText(overallNode.find(".span3 h2:nth-child(7)")));
		overall.raindrops = parseFloat(overallNode.find(".span3 h2:nth-child(8)").attr("title")
			.replace("raindrops", "").trim());
		stats.overall = overall;

		var objectiveNodes = $("#objectives h2");
		var monuments = parseInt(getText($(objectiveNodes[0])));
		var cores = parseInt(getText($(objectiveNodes[1])));
		var wools = parseInt(getText($(objectiveNodes[2])));
		stats.objectives = {
			monuments: monuments,
			cores: cores,
			wools: wools
		};
		var total_obs = 0.0;
		var gamemodes = ["project_ares", "blitz", "ghost_squadron"];
		for (var i = 1; i < statsNodes.length; i++) {
			var elm = $(statsNodes[i]);

			var headers = elm.find("h3");
			var kills = parseInt(getText($(headers[0])));
			var deaths = parseInt(getText($(headers[1])));
			var kd = parseFloat(getText($(headers[2])));
			var kk = parseFloat(getText($(headers[3])));
			var played = parseFloat(getText($(headers[4])));
			var observed = parseFloat(getText($(headers[5])));
			total_obs += observed;
			stats[gamemodes[i - 1]] = {
				kills: kills,
				deaths: deaths,
				kd: kd,
				kk: kk,
				played: played,
				observed: observed
			};
		}

		stats.overall.total_observed = total_obs;

		player.stats = stats;
		cb(player);
	});
};

exp.parseForum = function(body, page, cat, callback) {
	var $ = cheerio.load(body);
	var topics = [];

	var pagination = $(".span9 .btn-group.pull-left").first();
	var maxPage;
	var last = $(pagination).children().last();

	if ($(last).attr("href")) {
		maxPage = parseFloat($(last).attr("href").split("?page=")[1]);
	} else {
		maxPage = parseFloat($(last).text());
	}

	// check for pages above the max count
	if (page > maxPage) {
		return callback("Invalid page number", maxPage, null);
	}


	var topicList = $(".span9 table tbody tr");

	topicList.each(function(i, elm) {

		elm = $(elm);

		var topic = elm.children()[0];
		var tdata = $(topic).find("a");

		var title = $(tdata[0]).text();
		var id = $(tdata[0]).attr("href").match(/([0-9a-fA-F]{24})$/)[0];
		var author = $(tdata[1]).text();
		var category;

		if (cat === "new") {
			category = $(tdata[2]).text().escapeSpecialChars().trim();
		} else {
			category = $("#forum-sidebar .active a").text().escapeSpecialChars();
		}

		var latest = elm.children()[1];
		tdata = $(latest).find("a");

		var latestAuthor = $(tdata[1]).text();
		var latestTimestamp = $(tdata[2]).text();


		var posts = $(elm.children()[2]);
		posts = $(posts.children()[0]).text();
		var views = $(elm.children()[3]);
		views = $(views.children()[0]).text();


		var t = new Topic(title, id, author, category, latestAuthor, latestTimestamp, posts, views);
		topics.push(t);
	});

	callback(null, maxPage, topics, $);
};

exp.parseForumTopic = function($, id) {
	var header = $(".page-header > h3");
	var title = getText(header).escapeSpecialChars();
	var creator = header.find("a").text();
	var t = {
		id: id,
		title: title,
		author: creator
	};

	var posts = [];
	var rows = $(".span9 > div[id]");

	for (var i = 0; i < rows.length; i++) {
		var post = exp.parsePost($, $(rows[i]));

		posts.push(post);
	}

	t.posts = posts;
	return t;
};

exp.parsePost = function($, post) {
	var postId = post.attr("id");

	var content = post.find(".post-content").html().spaceSpecialChars().trim();

	var info = post.find(".span9 > .pull-left a:not(.label)");
	var author = $(info[1]).text().escapeSpecialChars();
	var change = $(info[2]).text().spaceSpecialChars().trim();

	var p = {
		id: postId,
		content: content,
		author: author,
		timestamp: change
	};

	var quote = post.find(".span9 > blockquote");
	if (quote.length) {
		var qInfo = quote.find("span");
		var qAuthor = $(qInfo[0]).text();
		var qTimestamp = $(qInfo[1]).text();
		var qContent = quote.find(".collapse").html().spaceSpecialChars().trim();
		var qId = quote.find(".collapse").attr("id").match(/([0-9a-fA-F]{24})$/)[0];
		p.quoting = {
			id: qId,
			author: qAuthor,
			timestamp: qTimestamp,
			content: qContent,
		};
	}
	return p;
};

exp.pageCount = function($, pagination) {
	var last = $(pagination).children().last();
	if ($(last).attr("href")) {
		var href = url.parse(config.base_url + $(last).attr("href")).query;
		var parsed = querystring.parse(href);
		return parseFloat(parsed.page);
	} else {
		return parseFloat($(last).text());
	}
};

exp.parseMapList = function($) {
	var maps = [];
	var list = $("div.map.thumbnail");

	list.each(function(i, elm) {
		elm = $(elm);

		var image = elm.find("img").attr("src");
		var shortId = elm.attr("id");
		var title = elm.find("h1.lead a");
		var longId = title.attr("href").replace("/maps/", "");
		var name = title.text();
		var authorNodes = elm.find("small a");
		var online = elm.find(".actions a.label");
		var servers = [];
		online.each(function(i, e) {
			servers.push($(e).text());
		});
		var authors = [];
		authorNodes.each(function(i, e) {
			authors.push($(e).text());
		});
		var rating = elm.find("> div:nth-child(2) > div[title]");
		rating = rating.attr("title").match(/([0-9]+\.[0-9][0-9]?)/)[0];
		rating = parseFloat(rating);

		maps.push({
			name: name,
			short_id: shortId,
			long_id: longId,
			image: image,
			rating: rating,
			authors: authors,
			servers: servers
		});
	});
	return maps;
};

exp.setMeta = function(req, page, pages) {
	var links = {};
	links.self = req.protocol + "://" + req.get("host") + req.originalUrl;

	if (page && pages) {
		var pagination = {};
		pagination.first = 1;
		pagination.prev = (page - 1 > 0 ? page - 1 : null);
		pagination.current = page;
		pagination.next = (page + 1 > pages ? null : page + 1);
		pagination.last = pages;

		links.pagination = pagination;
	}
	return links;
};


var getText = function(elm) {
	return elm.contents().filter(function() {
		return this.type === "text";
	}).text().escapeSpecialChars();
};

exp.getText = getText;

exp.getTextNodes = function(elm) {
	return elm.contents().filter(function() {
		// filter our blank (new lines) lines
		return this.type === "text" && this.data.length > 2;
	});
};

module.exports = exp;
