"use strict";
var cheerio = require("cheerio");
var request = require("request");

var Player = require("../modules/Player.js");
var Profile = require("../modules/Profile.js");
var ForumStats = require("../modules/ForumStats.js");
var ProjectAresStats = require("../modules/ProjectAresStats.js");
var BlitzStats = require("../modules/BlitzStats.js");
var GhostSquadronStats = require("../modules/GhostSquadronStats.js");
var Topic = require("../modules/topic");
var url = require("url");
var querystring = require("querystring");

var exp = {};

exp.scrapeFromProfile = function(name, cb) {
	var options = {
		uri: "http://oc.tc/stats/" + name,
		timeout: 2000,
		followAllRedirects: true
	};
	request(options, function(error, response, body) {
		if (error) {
			return cb(null, 500);
		} else if (response.statusCode !== 200) {
			return cb(null, 404);
		}
		var PAStats;
		var profile;
		var playerArray = [];
		var profileArray = [];
		var forumArray = [];
		var paArray = [];
		var blitzArray = [];
		var ghostArray = [];
		var socialArray = {};
		var $ = cheerio.load(body);
		if ($("body > div > section:nth-child(2) > div.row > div.span3 > div").text() !== "") {
			var toReturn = $("body > div > section:nth-child(2) > div.row > div.span3 > div").text().replace("\\n", "");
			playerArray.status = toReturn;
		} else if ($("body > div > section:nth-child(2) > div.row > div.span3 > span:nth-child(3)").children().length === 0) {
			var spanthree = $("body > div > section:nth-child(2) > div.row > div.span3 > strong").text();
			playerArray.status = "Seen " + spanthree + " ago".replace("\\n", "");
		} else {
			var spanthree = $("body > div > section:nth-child(2) > div.row > div.span3 > strong").text();
			playerArray.status = "Seen " + spanthree + " ago on " + $("body > div > section:nth-child(2) > div.row > div.span3 > span:nth-child(3) > a").text().replace("\\n", "");
		}
		playerArray.status = playerArray.status.escapeSpecialChars();
		playerArray.kills = $("body > div > section:nth-child(2) > div.row > div.span7 > div > div.span8 > div > div.span5 > h2").text().escapeSpecialChars().replace("kills", "");
		playerArray.deaths = $("body > div > section:nth-child(2) > div.row > div.span7 > div > div.span4 > h2").text().escapeSpecialChars().replace("deaths", "");
		playerArray.friends = $("body > div > section:nth-child(2) > div.row > div.span2 > h2").text().escapeSpecialChars().replace("friends", "");
		playerArray.kd = $("body > div > section:nth-child(2) > div.row > div.span3 > h2:nth-child(4)").text().escapeSpecialChars().replace("kd ratio", "");
		playerArray.kk = $("body > div > section:nth-child(2) > div.row > div.span3 > h2:nth-child(5)").text().escapeSpecialChars().replace("kk ratio", "");
		playerArray.joins = $("body > div > section:nth-child(2) > div.row > div.span3 > h2:nth-child(6)").text().escapeSpecialChars().replace("server joins", "");
		playerArray.time = $("body > div > section:nth-child(2) > div.row > div.span3 > h2:nth-child(7)").text().escapeSpecialChars().replace("days played", "");
		playerArray.raindrops = $("body > div > section:nth-child(2) > div.row > div.span3 > h2:nth-child(8)").attr("data-original-title").escapeSpecialChars().replace(" raindrops", "");
		playerArray.bottomObj = $("#objectives > div:nth-child(5) > div > h2").text().escapeSpecialChars();
		playerArray.midObj = $("#objectives > div:nth-child(3) > div > h2").text().escapeSpecialChars();
		playerArray.topObj = $("#objectives > div:nth-child(1) > div > h2").text().escapeSpecialChars();

		$(".span4").each(function(i, elem) {
			if ($(this).children().length == 4) {
				//bleh
			} else if ($(this).children("h6").text() == "Team") {
				socialArray.Team = $(this).children("blockquote").text();
			} else {
				socialArray[$(this).children("h6").text()] = $(this).children("blockquote").children("p").text();
			}
		});


		profileArray.bio = $("#about > div:nth-child(3) > div > pre").text();
		forumArray.posts = $("#stats > div:nth-child(2) > div > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("forum posts", "");
		forumArray.topics = $("#stats > div:nth-child(2) > div > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("topics started", "");
		
		paArray.kills = $("#stats > div:nth-child(4) > div.span4 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kills", "");
		paArray.deaths = $("#stats > div:nth-child(4) > div.span4 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("deaths", "");
		paArray.kd = $("#stats > div:nth-child(4) > div.span3 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kd", "");
		paArray.kk = $("#stats > div:nth-child(4) > div.span3 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("kk", "");
		paArray.played = $("#stats > div:nth-child(4) > div.span5 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("days played", "");
		paArray.observed = $("#stats > div:nth-child(4) > div.span5 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("days observed", "");
		
		blitzArray.kills = $("#stats > div:nth-child(6) > div.span4 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kills", "");
		blitzArray.deaths = $("#stats > div:nth-child(6) > div.span4 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("deaths", "");
		blitzArray.kd = $("#stats > div:nth-child(6) > div.span3 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kd", "");
		blitzArray.kk = $("#stats > div:nth-child(6) > div.span3 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("kk", "");
		blitzArray.played = $("#stats > div:nth-child(6) > div.span5 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("days played", "");
		blitzArray.observed = $("#stats > div:nth-child(6) > div.span5 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("days observed", "");
		
		ghostArray.kills = $("#stats > div:nth-child(8) > div.span4 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kills", "");
		ghostArray.deaths = $("#stats > div:nth-child(8) > div.span4 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("deaths", "");
		ghostArray.kd = $("#stats > div:nth-child(8) > div.span3 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kd", "");
		ghostArray.kk = $("#stats > div:nth-child(8) > div.span3 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("kk", "");
		ghostArray.played = $("#stats > div:nth-child(8) > div.span5 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("days played", "");
		ghostArray.observed = $("#stats > div:nth-child(8) > div.span5 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("days observed", "");
		
		PAStats = new ProjectAresStats(paArray.kills, paArray.deaths, paArray.kd, paArray.kk, paArray.played, paArray.observed);
		var Blitz = new BlitzStats(blitzArray.kills, blitzArray.deaths, blitzArray.kd, blitzArray.kk, blitzArray.played, blitzArray.observed);
		var ghost = new GhostSquadronStats(ghostArray.kills, ghostArray.deaths, ghostArray.kd, ghostArray.kk, ghostArray.played, ghostArray.observed);
		var forums = new ForumStats(forumArray.posts, forumArray.topics);
		profile = new Profile(socialArray.Team, socialArray.Skype, socialArray.Twitter, socialArray.Facebook, socialArray.Steam, socialArray.Twitch, socialArray.Github, socialArray.Youtube, profileArray.bio);
		var player = new Player(response.request.uri.href.substring(14, response.request.uri.href.length), playerArray.status, playerArray.kills, playerArray.deaths, playerArray.friends, playerArray.kd, playerArray.kk, playerArray.joins, playerArray.time, playerArray.raindrops, playerArray.cores, playerArray.monuments, playerArray.wools, profile, forums, PAStats, Blitz, ghost);
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
		maxPage = parseInt($(last).attr("href").split("?page=")[1]);
	} else {
		maxPage = parseInt($(last).text());
	}

	// check for pages above the max page count
	if (page > maxPage) {
		callback("Invalid page number", null, null);
	}


	var topicList = $(".span9 table tbody tr");

	topicList.each(function(i, elm) {

		elm = $(elm);

		var topic = elm.children()[0];
		var tdata = $(topic).find("a");

		// todo add id
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
	var title = exp.getText(header).escapeSpecialChars();
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

	var quote = post.find("blockquote");
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
		var href = url.parse("https://oc.tc" + $(last).attr("href")).query;
		var parsed = querystring.parse(href);
		return parseInt(parsed.page);
	} else {
		return parseInt($(last).text());
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

exp.getText = function(elm) {
	return elm.contents().filter(function() {
		return this.type === "text";
	}).text().escapeSpecialChars();
};

exp.getTextNodes = function(elm) {
	return elm.contents().filter(function() {
		// filter our blank (new lines) lines
		return this.type === "text" && this.data.length > 2;
	});
};

module.exports = exp;