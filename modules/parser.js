"use strict";
var cheerio = require("cheerio");
var Topic = require("../modules/topic");
var url = require("url");
var querystring = require("querystring");
var config = require("../config.example");
var helpers = require("./helpers");

var exp = {};

exp.parseProfile = function(name, cb) {
	var options = {
		url: "/users/" + name,
		followAllRedirects: false
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
		var status,
			server = $(".server").children("a").text();
		if($(".offline") !== null){
			status = "Last seen " + $(".time").attr("title");
			if(server !== "") {
				status += " on " + server;
			}
		}
		else{
			status = "Online"
			if(server !== "") {
				status += " on " + server;
			}
		}
		status = status.escapeSpecialChars();
		player.status = status;
		
		// Get Forum Status

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
		profile.bio = $("#about > div:nth-child(3) > div > pre").html().replace(/"/g, "'");

		player.profile = profile;

		// Get Friends
		player.friends = {};
		var friendsParent = $(".heads > div.span2:nth-child(3)");
		player.friends.count = parseInt($(friendsParent).children("div.number").text());

		var friends = [];
		var friendNodes = friendsParent.find("a");
		friendNodes.each(function() {
			friends.push($(this).children("img").attr("alt"));
		});
		player.friends.sample = friends;

		// Get Ranks
		var ranks = [];
		$(".label").each(function() {
			var rank = {};
			rank.name = $(this).text();
			rank.background = $(this).css("background-color");
			rank.text = $(this).css("color");
			ranks.push(rank);
		});
		player.ranks = ranks;

		// Get Trophies
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
		
		// Get Overall Stats
		var overall = {};
		var overallNode = $("section:nth-child(2) > div.row");
		overall.kills = parseInt(overallNode.find("div.heads").children("div:nth-child(1)").children("div.number").text());
		overall.deaths = parseInt(overallNode.find("div.heads").children("div:nth-child(2)").children("div.number").text());
		overall.joins = parseInt($("#stats > div.row > div:nth-child(3) > h3").text().replace("teams joined",""));
		overall.joined = $("#stats > div.row > div:nth-child(1) > h3").attr("title").replace("First joined on","").trim();
		overall.played = parseInt($("#stats > div.row > div:nth-child(2) > h3").text().replace("hours played","").escapeSpecialChars());
		overall.raindrops = parseInt($("#stats > div.row > div:nth-child(4) > h3").text().replace("raindrops","").trim());
		stats.overall = overall;

		// Get Ranked Stats
		var ranked = {};
		var rankedNode = $(".stats").children(".well");
		ranked.rank = parseInt(getText($(rankedNode.find("div.rank:nth-child(1) > a.number"))).replace("th","").replace("rd","").replace("nd","").replace("st",""));
		ranked.rating = parseFloat(getText($("div.rank:nth-child(2) > div.number")));
		var matches = $(rankedNode.find("div:nth-child(4)"));
		ranked.matches = parseInt(getText($(matches.find("div.total:nth-child(1)").children(".number"))));
		ranked.wins =parseInt(getText($(matches.find("div.total:nth-child(2)").children(".number"))));
		ranked.losses = parseInt(getText($(matches.find("div.total:nth-child(3)").children(".number"))));
		ranked.forfeits = parseInt(getText($(matches.find("div.total:nth-child(4)").children(".number"))));
		stats.ranked = ranked;

		// Get Objective Stats
		var objectiveNodes = $("#objectives h2");
		var monuments,cores,wools;
		objectiveNodes.each(function(i){
			if($(this).children("small").text()==="wools placed"){
				wools = parseInt($(this).text().replace("wools placed","").escapeSpecialChars());
			}
			else if($(this).children("small").text()==="monuments destroyed"){
				monuments = parseInt($(this).text().replace("monuments destroyed","").escapeSpecialChars());
			}
			else if($(this).children("small").text()==="cores leaked"){
				cores = parseInt($(this).text().replace("cores leaked","").escapeSpecialChars());
			}
			else{}
		});
		stats.objectives = {
			monuments: monuments,
			cores: cores,
			wools: wools
		};

		// Get Forum Stats
		var statsNodes = $(".row-fluid");
		var forums = {};
		var forumsNode = $(statsNodes[0]);
		forums.posts = parseInt(getText($("#stats > div:nth-child(3) > div > div > div:nth-child(1) > h3")));
		forums.topics = parseInt(getText($("#stats > div:nth-child(3) > div > div > div:nth-child(2) > h3")));
		stats.forums = forums;

		// Get Gamemode Stats
		var total_obs = 0.0;
		var gamemodes = ["project_ares", "blitz", "ghost_squadron"];
		stats["project_ares"] = exp.getStat($,5);
		stats["blitz"] = exp.getStat($,7);
		stats["ghost_squadron"] = exp.getStat($,9);
		total_obs = stats["project_ares"].observed+stats["blitz"].observed+stats["ghost_squadron"].observed;
		total_obs = parseFloat(total_obs.toFixed(2));
		stats.overall.observed = total_obs;

		player.stats = stats;
		cb(player);
	});
};
exp.getForumStatus = function(player,cb){
		var options = {
		url: "/forums/",
		followAllRedirects: false
	};
	helpers.request(options,function(err,response,body){
		if(err) throw err;
		var $ = cheerio.load(body);
		$("#forum-sidebar > small").children("a").each(function(){
			if($(this).text().toLowerCase()===player.toLowerCase()){
				 cb(true);
				 return;
			}	
			else{}
		});
		cb(false);
		return;
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
	var author = $(header).children("small").text().replace("by","").escapeSpecialChars();
	var title = $(header).children("a").text().escapeSpecialChars();
	var t = {
		id: id,
		title: title,
		author: author
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

exp.getStat = function($,number){
	return {
		kills:parseInt($("#stats > div:nth-child("+number+") > div.span4 > div > div:nth-child(1) > h3").text().replace("kills","").trim()),
		deaths:parseInt($("#stats > div:nth-child("+number+") > div.span4 > div > div:nth-child(2) > h3").text().replace("deaths","").trim()),
		kd:parseFloat($("#stats > div:nth-child("+number+") > div.span3 > div > div:nth-child(1) > h3").text().replace("kd","").trim()),
		kk:parseFloat($("#stats > div:nth-child("+number+") > div.span3 > div > div:nth-child(2) > h3").text().replace("kk","").trim()),
		played:parseFloat($("#stats > div:nth-child("+number+") > div.span5 > div > div:nth-child(1) > h3").text().replace("days played","").trim()),
		observed:parseFloat($("#stats > div:nth-child("+number+") > div.span5 > div > div:nth-child(2) > h3").text().replace("days observed","").trim())
		};
	};
module.exports = exp;
