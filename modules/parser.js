"use strict";
var cheerio = require("cheerio"),
    Player = require("../modules/Player.js"),
    Profile = require("../modules/Profile.js"),
    OverallStats = require("../modules/OverallStats.js"),
    ForumStats = require("../modules/ForumStats.js"),
    ProjectAresStats = require("../modules/ProjectAresStats.js"),
    BlitzStats = require("../modules/BlitzStats.js"),
    GhostSquadronStats = require("../modules/GhostSquadronStats.js"),
    ObjectiveStats = require("../modules/ObjectiveStats.js"),
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
        if (error) {
            return cb(null, 500);
        } else if (response.statusCode !== 200) {
            return cb(null, 404);
        }
        var profile;
        var playerArray = [];
        var profileArray = [];
        var overallArray = [];
        var forumArray = [];
        var paArray = [];
        var blitzArray = [];
        var ghostArray = [];
        var socialArray = {};
        var objectivesArray = {};
        var $ = cheerio.load(body);
		var trophyHash = {};
		trophyHash["Oooh, kill em!"] = "Reach 10k kills";
		trophyHash["One Giant Leap_"] = "Reach 100k kills";
		trophyHash["Sign Me Up"] = "Register and confirm email address";
		trophyHash["Ref"] = "Referee a tournament";
		trophyHash["Official Business"] = "Be a member of the staff";
		trophyHash["Language Savant"] = "Help translate the Overcast Network";
		trophyHash["Sapper"] = "Licensed TNT handler";
		trophyHash["Chick Magnet"] = "Have the cutest skin on Overcast";
		trophyHash["Decryption Master"] = "Destroy apple's decryption challenge";
		trophyHash["Harcour Parkour"] = "Won the parkour challenge";
		trophyHash["War Wars"] = "Win the April Fool's Tournament";
		trophyHash["Rudolph"] = "Deliver one gift on the 2013 Secret Santa";
		trophyHash["Busy Elf"] = "Deliver five gifts on the 2013 Secret Santa";
		trophyHash["Santa Clause"] = "Deliver ten gifts on the 2013 Secret Santa";
		trophyHash["Let it Rain"] = "Deliver one gift on the 2014 Secret Santa";
		trophyHash["A Storm is Brewing"] = "Deliver five gifts on the 2014 Secret Santa";
		trophyHash["Downpour"] = "Deliver ten gifts on the 2014 Secret Santa";
		trophyHash["Badass"] = "Sell contraband on the black market";
		trophyHash["Regular"] = "Exchange five pieces of contraband";
		trophyHash["Locked up"] = "Get put in the SHU for selling contraband";
		trophyHash["House of Cores"] = "Win the House of Cores tournament";
		trophyHash["Boom in a Box"] = "Win Boom in a Box";
		trophyHash["Conquest"] = "Win the Conquest tournament";
		trophyHash["Beta Tournament"] = "Win the Beta Tournament";
		trophyHash["Return of the Hill"] = "Win the Return of the Hill tournament";
		
        // Get Name
        playerArray.username = $("h1 span").first().text().trim();
        var formerUser = $("h1 small");
        if (formerUser) {
            playerArray.previous_username = formerUser.first().text().replace(/\(|\)|formerly/gi, "").trim() || null;;
        }

        // Get Status
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

        // Get Friends
        playerArray.friends = parseFloat($("body > div > section:nth-child(2) > div.row > div.span2 > h2").text().escapeSpecialChars().replace("friends", ""));

        // Get Objectives
        var unsorted = [];
        unsorted.push($("#objectives > div:nth-child(1) > div > h2").text().escapeSpecialChars());
        unsorted.push($("#objectives > div:nth-child(3) > div > h2").text().escapeSpecialChars());
        unsorted.push($("#objectives > div:nth-child(5) > div > h2").text().escapeSpecialChars());
        for (var i = 0; i < unsorted.length; i++) {
            var current = unsorted[i];
            if (current.indexOf("cores leaked") > -1) {
                current = current.replace("cores leaked", "");
                objectivesArray.cores = parseFloat(current);
            } else if (current.indexOf("monuments destroyed") > -1) {
                current = current.replace("monuments destroyed", "");
                objectivesArray.monuments = parseFloat(current);
            } else {
                current = current.replace("wools placed", "");
                objectivesArray.wools = parseFloat(current);
            }
        }

        // Get Social Links
        $(".span4").each(function(i, elem) {
            if ($(this).children("h6").text() == "Team") {
                socialArray.team = $(this).children("blockquote").text().escapeSpecialChars();
            } else {
                socialArray[$(this).children("h6").text().toLowerCase()] = $(this).children("blockquote").children("p").text().escapeSpecialChars();
            }
        });

        // Get Bio
        profileArray.bio = $("#about > div:nth-child(3) > div > pre").text();

        // Get Overall Stats
        overallArray.kills = parseFloat($("body > div > section:nth-child(2) > div.row > div.span7 > div > div.span8 > div > div.span5 > h2").attr("title").escapeSpecialChars().replace(" kills", ""));
        overallArray.deaths = parseFloat($("body > div > section:nth-child(2) > div.row > div.span7 > div > div.span4 > h2").text().escapeSpecialChars().replace("deaths", ""));
        overallArray.kd = parseFloat($("body > div > section:nth-child(2) > div.row > div.span3 > h2:nth-child(4)").text().escapeSpecialChars().replace("kd ratio", ""));
        overallArray.kk = parseFloat($("body > div > section:nth-child(2) > div.row > div.span3 > h2:nth-child(5)").text().escapeSpecialChars().replace("kk ratio", ""));
        overallArray.joins = parseFloat($("body > div > section:nth-child(2) > div.row > div.span3 > h2:nth-child(6)").text().escapeSpecialChars().replace("server joins", ""));
        overallArray.firstjoin = $("body > div > section:nth-child(2) > div.row > div.span3 > h2:nth-child(6)").attr("title").escapeSpecialChars().replace("First joined on ", "");
        overallArray.played = parseFloat($("body > div > section:nth-child(2) > div.row > div.span3 > h2:nth-child(7)").text().escapeSpecialChars().replace("days played", ""));
        overallArray.raindrops = parseFloat($("body > div > section:nth-child(2) > div.row > div.span3 > h2:nth-child(8)").attr("title").escapeSpecialChars().replace(" raindrops", ""));

        // Get Forum stats
        forumArray.posts = parseFloat($("#stats > div:nth-child(2) > div > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("forum posts", ""));
        forumArray.topics = parseFloat($("#stats > div:nth-child(2) > div > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("topics started", ""));

        // Get Project Ares Stats
        paArray.kills = parseFloat($("#stats > div:nth-child(4) > div.span4 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kills", ""));
        paArray.deaths = parseFloat($("#stats > div:nth-child(4) > div.span4 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("deaths", ""));
        paArray.kd = parseFloat($("#stats > div:nth-child(4) > div.span3 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kd", ""));
        paArray.kk = parseFloat($("#stats > div:nth-child(4) > div.span3 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("kk", ""));
        paArray.played = parseFloat($("#stats > div:nth-child(4) > div.span5 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("days played", ""));
        paArray.observed = parseFloat($("#stats > div:nth-child(4) > div.span5 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("days observed", ""));

        // Get Blitz Stats
        blitzArray.kills = parseFloat($("#stats > div:nth-child(6) > div.span4 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kills", ""));
        blitzArray.deaths = parseFloat($("#stats > div:nth-child(6) > div.span4 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("deaths", ""));
        blitzArray.kd = parseFloat($("#stats > div:nth-child(6) > div.span3 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kd", ""));
        blitzArray.kk = parseFloat($("#stats > div:nth-child(6) > div.span3 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("kk", ""));
        blitzArray.played = parseFloat($("#stats > div:nth-child(6) > div.span5 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("days played", ""));
        blitzArray.observed = parseFloat($("#stats > div:nth-child(6) > div.span5 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("days observed", ""));

        // Get Ghost Squadron Stats
        ghostArray.kills = parseFloat($("#stats > div:nth-child(8) > div.span4 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kills", ""));
        ghostArray.deaths = parseFloat($("#stats > div:nth-child(8) > div.span4 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("deaths", ""));
        ghostArray.kd = parseFloat($("#stats > div:nth-child(8) > div.span3 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kd", ""));
        ghostArray.kk = parseFloat($("#stats > div:nth-child(8) > div.span3 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("kk", ""));
        ghostArray.played = parseFloat($("#stats > div:nth-child(8) > div.span5 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("days played", ""));
        ghostArray.observed = parseFloat($("#stats > div:nth-child(8) > div.span5 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("days observed", ""));


        // Output

        var ranksArray = new Array();
        $(".label").each(function(i) {
            var rank = {};
            rank.name = $(this).text();
            rank.background = $(this).css("background-color");
            rank.text = $(this).css("color");
            ranksArray.push(rank);
        });
        
        var trophiesArray = new Array();
        var trophyParent = $(".thumbnails");
        trophyParent.children("li").each(function(i){
        	var newTrophy = {};
        	newTrophy.name = $(this).children(".thumbnail").children("h4").text();
        	//need to parse auto
        	newTrophy.description = trophyHash[newTrophy.name];
        	trophiesArray.push(newTrophy);
        });
        
        var overall = new OverallStats(overallArray.kills, overallArray.deaths, overallArray.kd, overallArray.kk, overallArray.joins, overallArray.firstjoin, overallArray.played, overallArray.raindrops);
        var PAStats = new ProjectAresStats(paArray.kills, paArray.deaths, paArray.kd, paArray.kk, paArray.played, paArray.observed);
        var Blitz = new BlitzStats(blitzArray.kills, blitzArray.deaths, blitzArray.kd, blitzArray.kk, blitzArray.played, blitzArray.observed);
        var ghost = new GhostSquadronStats(ghostArray.kills, ghostArray.deaths, ghostArray.kd, ghostArray.kk, ghostArray.played, ghostArray.observed);
        var forums = new ForumStats(forumArray.posts, forumArray.topics);
        var objectives = new ObjectiveStats(objectivesArray.cores, objectivesArray.monuments, objectivesArray.wools);
        profile = new Profile(socialArray.skype, socialArray.twitter, socialArray.facebook, socialArray.steam, socialArray.youtube, socialArray.twitch, socialArray.github, socialArray.team, profileArray.bio);
        var player = new Player(playerArray.username, playerArray.previous_username, playerArray.status, playerArray.friends, profile, ranksArray,trophiesArray, overall, objectives, forums, PAStats, Blitz, ghost);
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
        // fix this
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