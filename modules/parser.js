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

var ex = {};

ex.scrapeFromProfile = function(name, cb) {
	request("http://oc.tc/stats/" + name, function(error, response, body) {
		console.log(response);
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
		var $ = cheerio.load(body);
		if ($("body > div > section:nth-child(2) > div.row > div.span3 > div").text() != "") {
			var toReturn = $("body > div > section:nth-child(2) > div.row > div.span3 > div").text().replace("\\n", "");
			playerArray["staus"] = toReturn;
		} else {
			var spanthree = $("body > div > section:nth-child(2) > div.row > div.span3 > strong");
			playerArray["status"] = "Seen " + spanthree.text() + " ago on " + $("body > div > section:nth-child(2) > div.row > div.span3 > span:nth-child(3) > a").text().replace("\\n", "");
		}
		playerArray["status"] = playerArray["status"].escapeSpecialChars();
		playerArray["kills"] = $("body > div > section:nth-child(2) > div.row > div.span7 > div > div.span8 > div > div.span5 > h2").text().escapeSpecialChars().replace("kills", "");
		playerArray["deaths"] = $("body > div > section:nth-child(2) > div.row > div.span7 > div > div.span4 > h2").text().escapeSpecialChars().replace("deaths", "");
		playerArray["friends"] = $("body > div > section:nth-child(2) > div.row > div.span2 > h2").text().escapeSpecialChars().replace("friends", "");
		playerArray["kd"] = $("body > div > section:nth-child(2) > div.row > div.span3 > h2:nth-child(4)").text().escapeSpecialChars().replace("kd ratio", "");
		playerArray["kk"] = $("body > div > section:nth-child(2) > div.row > div.span3 > h2:nth-child(5)").text().escapeSpecialChars().replace("kk ratio", "");
		playerArray["joins"] = $("body > div > section:nth-child(2) > div.row > div.span3 > h2:nth-child(6)").text().escapeSpecialChars().replace("server joins", "");
		playerArray["time"] = $("body > div > section:nth-child(2) > div.row > div.span3 > h2:nth-child(7)").text().escapeSpecialChars().replace("days played", "");
		playerArray["raindrops"] = $("body > div > section:nth-child(2) > div.row > div.span3 > h2:nth-child(8)").text().escapeSpecialChars().replace("raindrops", "");
		playerArray["bottomObj"] = $("#objectives > div:nth-child(5) > div > h2").text().escapeSpecialChars();
		playerArray["midObj"] = $("#objectives > div:nth-child(3) > div > h2").text().escapeSpecialChars();
		playerArray["topObj"] = $("#objectives > div:nth-child(1) > div > h2").text().escapeSpecialChars();
		if (String(playerArray["topObj"]).indexOf("cores") !== -1) {
			playerArray["cores"] = playerArray["topObj"].replace("cores leaked", "");
		} else if (String(playerArray["topObj"]).indexOf("monuments") !== -1) {
			playerArray["monuments"] = playerArray["topObj"].replace("monuments destroyed", "");
		} else {
			playerArray["wools"] = playerArray["topObj"].replace("wools placed", "");
		}
		if (String(playerArray["midObj"]).indexOf("cores") !== -1) {
			playerArray["cores"] = playerArray["midObj"].replace("cores leaked", "");
		} else if (String(playerArray["midObj"]).toString().indexOf("monuments") !== -1) {
			playerArray["monuments"] = playerArray["midObj"].replace("monuments destroyed", "");
		} else {
			playerArray["wools"] = playerArray["topObj"].replace("wools placed", "");
		}
		if (String(playerArray["bottomObj"]).indexOf("cores") !== -1) {
			playerArray["cores"] = playerArray["bottomObj"].replace("cores leaked", "");
		} else if (String(playerArray["bottomObj"]).indexOf("monuments") !== -1) {
			playerArray["monuments"] = playerArray["bottomObj"].replace("monuments destroyed", "");
		} else {
			playerArray["wools"] = playerArray["bottomObj"].replace("wools placed", "");
		}
		profileArray["first"] = $("#about > div:nth-child(1) > div:nth-child(1) > blockquote > p").text().escapeSpecialChars();
		profileArray["second"] = $("#about > div:nth-child(1) > div:nth-child(2) > blockquote > p > a").text().escapeSpecialChars();
		profileArray["third"] = $("#about > div:nth-child(1) > div:nth-child(3) > blockquote > p > a").text().escapeSpecialChars();
		profileArray["fourth"] = $("#about > div:nth-child(1) > div:nth-child(4) > blockquote > p > a").text().escapeSpecialChars();
		profileArray["fifth"] = $("#about > div:nth-child(1) > div:nth-child(5) > blockquote > p > a").text().escapeSpecialChars();
		profileArray["sixth"] = $("#about > div:nth-child(1) > div:nth-child(6) > blockquote > p > a").text().escapeSpecialChars();

		if ($("#about > div:nth-child(1) > div:nth-child(1) > h6").text().toString().indexOf("Skype") !== -1) {
			profileArray["skype"] = profileArray["first"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(1) > h6").text().toString().indexOf("Twitter") !== -1) {
			profileArray["twitter"] = profileArray["first"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(1) > h6").text().toString().indexOf("Facebook") !== -1) {
			profileArray["facebook"] = profileArray["first"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(1) > h6").text().toString().indexOf("Steam") !== -1) {
			profileArray["steam"] = profileArray["first"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(1) > h6").text().toString().indexOf("Twitch") !== -1) {
			profileArray["twitch"] = profileArray["first"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(1) > h6").text().toString().indexOf("Github") !== -1) {
			profileArray["github"] = profileArray["first"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(1) > h6").text().toString().indexOf("YouTube") !== -1) {
			profileArray["youtube"] = profileArray["first"];
		}
		if ($("#about > div:nth-child(1) > div:nth-child(2) > h6").text().toString().indexOf("Skype") !== -1) {
			profileArray["skype"] = profileArray["second"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(2) > h6").text().toString().indexOf("Twitter") !== -1) {
			profileArray["twitter"] = profileArray["second"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(2) > h6").text().toString().indexOf("Facebook") !== -1) {
			profileArray["facebook"] = profileArray["second"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(2) > h6").text().toString().indexOf("Steam") !== -1) {
			profileArray["steam"] = profileArray["second"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(2) > h6").text().toString().indexOf("Twitch") !== -1) {
			profileArray["twitch"] = profileArray["second"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(2) > h6").text().toString().indexOf("Github") !== -1) {
			profileArray["github"] = profileArray["second"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(2) > h6").text().toString().indexOf("YouTube") !== -1) {
			profileArray["youtube"] = profileArray["second"];
		}
		if ($("#about > div:nth-child(1) > div:nth-child(3) > h6").text().toString().indexOf("Skype") !== -1) {
			profileArray["skype"] = profileArray["third"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(3) > h6").text().toString().indexOf("Twitter") !== -1) {
			profileArray["twitter"] = profileArray["third"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(3) > h6").text().toString().indexOf("Facebook") !== -1) {
			profileArray["facebook"] = profileArray["third"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(3) > h6").text().toString().indexOf("Steam") !== -1) {
			profileArray["steam"] = profileArray["third"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(3) > h6").text().toString().indexOf("Twitch") !== -1) {
			profileArray["twitch"] = profileArray["third"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(3) > h6").text().toString().indexOf("Github") !== -1) {
			profileArray["github"] = profileArray["third"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(3) > h6").text().toString().indexOf("YouTube") !== -1) {
			profileArray["youtube"] = profileArray["third"];
		}
		if ($("#about > div:nth-child(1) > div:nth-child(4) > h6").text().toString().indexOf("Skype") !== -1) {
			profileArray["skype"] = profileArray["fourth"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(4) > h6").text().toString().indexOf("Twitter") !== -1) {
			profileArray["twitter"] = profileArray["fourth"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(4) > h6").text().toString().indexOf("Facebook") !== -1) {
			profileArray["facebook"] = profileArray["fourth"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(4) > h6").text().toString().indexOf("Steam") !== -1) {
			profileArray["steam"] = profileArray["fourth"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(4) > h6").text().toString().indexOf("Twitch") !== -1) {
			profileArray["twitch"] = profileArray["fourth"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(4) > h6").text().toString().indexOf("Github") !== -1) {
			profileArray["github"] = profileArray["fourth"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(4) > h6").text().toString().indexOf("YouTube") !== -1) {
			profileArray["youtube"] = profileArray["fourth"];
		}
		if ($("#about > div:nth-child(1) > div:nth-child(5) > h6").text().toString().indexOf("Skype") !== -1) {
			profileArray["skype"] = profileArray["fifth"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(5) > h6").text().toString().indexOf("Twitter") !== -1) {
			profileArray["twitter"] = profileArray["fifth"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(5) > h6").text().toString().indexOf("Facebook") !== -1) {
			profileArray["facebook"] = profileArray["fifth"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(5) > h6").text().toString().indexOf("Steam") !== -1) {
			profileArray["steam"] = profileArray["fifth"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(5) > h6").text().toString().indexOf("Twitch") !== -1) {
			profileArray["twitch"] = profileArray["fifth"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(5) > h6").text().toString().indexOf("Github") !== -1) {
			profileArray["github"] = profileArray["fifth"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(5) > h6").text().toString().indexOf("YouTube") !== -1) {
			profileArray["youtube"] = profileArray["fifth"];
		}
		if ($("#about > div:nth-child(1) > div:nth-child(6) > h6").text().toString().indexOf("Skype") !== -1) {
			profileArray["skype"] = profileArray["sixth"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(6) > h6").text().toString().indexOf("Twitter") !== -1) {
			profileArray["twitter"] = profileArray["sixth"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(6) > h6").text().toString().indexOf("Facebook") !== -1) {
			profileArray["facebook"] = profileArray["sixth"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(6) > h6").text().toString().indexOf("Steam") !== -1) {
			profileArray["steam"] = profileArray["sixth"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(6) > h6").text().toString().indexOf("Twitch") !== -1) {
			profileArray["twitch"] = profileArray["sixth"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(6) > h6").text().toString().indexOf("Github") !== -1) {
			profileArray["github"] = profileArray["sixth"];
		} else if ($("#about > div:nth-child(1) > div:nth-child(6) > h6").text().toString().indexOf("YouTube") !== -1) {
			profileArray["youtube"] = profileArray["sixth"];
		}

		profileArray["bio"] = $("#about > div:nth-child(3) > div > pre").text();
		forumArray["posts"] = $("#stats > div:nth-child(2) > div > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("forum posts", "");
		forumArray["topics"] = $("#stats > div:nth-child(2) > div > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("topics started", "");
		paArray["kills"] = $("#stats > div:nth-child(4) > div.span4 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kills", "");
		paArray["deaths"] = $("#stats > div:nth-child(4) > div.span4 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("deaths", "");
		paArray["kd"] = $("#stats > div:nth-child(4) > div.span3 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kd", "");
		paArray["kk"] = $("#stats > div:nth-child(4) > div.span3 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("kk", "");
		paArray["played"] = $("#stats > div:nth-child(4) > div.span5 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("days played", "");
		paArray["observed"] = $("#stats > div:nth-child(4) > div.span5 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("days observed", "");
		blitzArray["kills"] = $("#stats > div:nth-child(6) > div.span4 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kills", "");
		blitzArray["deaths"] = $("#stats > div:nth-child(6) > div.span4 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("deaths", "");
		blitzArray["kd"] = $("#stats > div:nth-child(6) > div.span3 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kd", "");
		blitzArray["kk"] = $("#stats > div:nth-child(6) > div.span3 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("kk", "");
		blitzArray["played"] = $("#stats > div:nth-child(6) > div.span5 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("days played", "");
		blitzArray["observed"] = $("#stats > div:nth-child(6) > div.span5 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("days observed", "");
		ghostArray["kills"] = $("#stats > div:nth-child(8) > div.span4 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kills", "");
		ghostArray["deaths"] = $("#stats > div:nth-child(8) > div.span4 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("deaths", "");
		ghostArray["kd"] = $("#stats > div:nth-child(8) > div.span3 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kd", "");
		ghostArray["kk"] = $("#stats > div:nth-child(8) > div.span3 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("kk", "");
		ghostArray["played"] = $("#stats > div:nth-child(8) > div.span5 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("days played", "");
		ghostArray["observed"] = $("#stats > div:nth-child(8) > div.span5 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("days observed", "");
		PAStats = new ProjectAresStats(paArray["kills"], paArray["deaths"], paArray["kd"], paArray["kk"], paArray["played"], paArray["observed"]);
		var Blitz = new BlitzStats(blitzArray["kills"], blitzArray["deaths"], blitzArray["kd"], blitzArray["kk"], blitzArray["played"], blitzArray["observed"]);
		var ghost = new GhostSquadronStats(ghostArray["kills"], ghostArray["deaths"], ghostArray["kd"], ghostArray["kk"], ghostArray["played"], ghostArray["observed"]);
		var forums = new ForumStats(forumArray["posts"], forumArray["started"]);
		profile = new Profile(profileArray["skype"], profileArray["twitter"], profileArray["facebook"], profileArray["steam"], profileArray["twitch"], profileArray["github"], profileArray["Youtube"], profileArray["bio"]);
		player = new Player(name, playerArray["status"], playerArray["kills"], playerArray["deaths"], playerArray["friends"], playerArray["kd"], playerArray["kk"], playerArray["joins"], playerArray["time"], playerArray["raindrops"], playerArray["cores"], playerArray["monuments"], playerArray["wools"], profile, forums, PAStats, Blitz, ghost);
		cb(player);

	});
};

ex.parseForum = function(body, page, cat, callback) {
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

		var title = $(tdata[0]).text();
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


		var t = new Topic(title, author, category, latestAuthor, latestTimestamp, posts, views);
		topics.push(t);
	});

	callback(null, maxPage, topics, $);
}

ex.pageCount = function($, pagination) {
	var last = $(pagination).children().last();
	if ($(last).attr("href")) {
		var href = url.parse("https://oc.tc" + $(last).attr("href")).query;
		var parsed = querystring.parse(href);
		return parseInt(parsed.page);
	} else {
		return parseInt($(last).text());
	}
}

ex.parseMapList = function($) {
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
}

ex.getText = function(elm) {
	return elm.contents().filter(function() {
		return this.type === 'text';
	}).text().escapeSpecialChars();
}

ex.getTextNodes = function(elm) {
	return elm.contents().filter(function() {
		// filter our blank (new lines) lines
		return this.type === 'text' && this.data.length > 2;
	});
}

module.exports = ex;