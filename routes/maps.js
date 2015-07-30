"use strict";
var express = require("express");
var router = express.Router();
var parser = require("../modules/parser");
var cheerio = require("cheerio");
var helpers = require("../modules/helpers");
var cache = require("../modules/cache");

var gamemodes = ["tdm", "ctw", "ctf",
    "dtc", "blitz", "rage", "gs", "mixed"
];

router.get("/playing", function(req, res) {
    var options = {
        method: "GET",
        url: "/maps"
    };

    helpers.request(options, function(error, response, body) {
        if (error) {
            console.error(error);
            return res.status(500).json({
                errors: ["Unable to complete request"]
            });
        }

        var $ = cheerio.load(body);

        var maps = parser.parseMapList($);
        var links = parser.setMeta(req);

        var response = {
            links: links,
            data: maps
        };
        res.json(response);
        cache.cache_response(res, response, "maps_playing");
    });
});

router.get("/all", function(req, res) {
    var page = req.query.page || 1;
    var options = {
        method: "GET",
        url: "/maps/all?page=" + page
    };

    helpers.request(options, function(error, response, body) {
        if (error) {
            console.error(error);
            return res.status(500).json({
                errors: ["Unable to complete request"]
            });
        }

        var $ = cheerio.load(body);

        var pagination = $(".span12 .btn-group.pull-left").first();
        var pages = parser.pageCount($, pagination);

        if (page > pages) {
            return res.status(422).json({
                errors: ["Invalid page number"]
            });
        }

        var links = parser.setMeta(req, page, pages);
        var maps = parser.parseMapList($);

        var response = {
            links: links,
            data: maps
        };

        res.json(response);
        cache.cache_response(res, response, "maps_all");
    });
});

router.get("/:id", function(req, res) {
    var id = req.params.id;
    var options = {
        method: "GET",
        url: "/maps/" + id
    };

    helpers.request(options, function(error, response, body) {
        if (error) {
            console.error(error);
            return res.status(500).json({
                errors: ["Unable to complete request"]
            });
        } else if (response.statusCode === 404) {
            return res.status(404).json({
                errors: ["Map not found"]
            });
        }

        var $ = cheerio.load(body);

        var map = {};
        var links = parser.setMeta(req);

        var header = $(".span8 h1");
        var name = parser.getText(header);
        var version = header.find("small").text();
        var author = $(".span8 b a").text();
        var teams = $(".span8 dd").first().children();
        var teamList = [];
        var texts = parser.getTextNodes($(".span8 dd").first());

        for (var i = 0; i < teams.length; i++) {
            var elm = $(teams[i]);
            if (elm.is("br")) continue;
            var teamName;
            var teamColor;
            var teamPlayers;
            if (elm.is("strong")) {
                teamColor = elm.css("color");
                teamName = elm.text();
                teamPlayers = $(texts[teamList.length]).text()
                    .escapeSpecialChars().match(/[0-9][0-9]*/)[0];
                teamPlayers = parseInt(teamPlayers);
            }

            teamList.push({
                name: teamName,
                color: teamColor,
                player_count: teamPlayers
            });
        }

        var gamemode = $($(".dropdown .dropdown-toggle")[3]).text().escapeSpecialChars();

        var objective = $(".span8 dd strong").text();
        var image = $(".span4 img.thumbnail").attr("src");

        var latest = {};
        var all = {};

        function parseVotes(sel, hash) {
            hash.average = parseFloat(parser.getText(sel.find("h1"))
                .match(/([0-9]+\.[0-9][0-9]?)/)[0]);
            hash.total_votes = parseInt(sel.find("table thead th")
                .text().match(/[0-9][0-9]*/)[0]);
            var rows = sel.find("table tbody tr td:nth-child(2) div");
            hash.votes = {};
            for (var i = 0; i < rows.length; i++) {
                var row = $(rows[i]);
                hash.votes[i + 1] = parseInt(row.text());
            }
        }

        parseVotes($(".tab-pane#ratings-latest"), latest);
        parseVotes($(".tab-pane#ratings-all"), all);

        map = {
            name: name,
            version: version,
            author: author,
            gamemode: gamemode,
            objective: objective,
            image: image,
            teams: teamList,
            ratings: {
                latest: latest,
                all: all
            }
        };

        var response = {
            links: links,
            data: map
        };

        res.json(response);
        cache.cache_response(res, response, "map");
    });
});

router.get("/gamemode/:gamemode", function(req, res) {
    var page = req.query.page || 1;
    var gamemode = req.params.gamemode;
    var options = {
        method: "GET",
        url: "/maps/gamemode/" + gamemode + "/?page=" + page
    };

    if (gamemodes.indexOf(gamemode) === -1) {
        return res.status(422).json({
            errors: ["Invalid gamemode"]
        });
    }

    helpers.request(options, function(error, response, body) {
        var $ = cheerio.load(body);

        var pagination = $(".span12 .btn-group.pull-left").first();
        var pages = parser.pageCount($, pagination);

        var links = parser.setMeta(req, page, pages);

        if (page > pages) {
            return res.status(422).json({
                errors: ["Invalid page number"]
            });
        }

        var meta = {};
        meta.gamemode = gamemode;

        var maps = parser.parseMapList($);

        var response = {
            links: links,
            meta: gamemode,
            data: maps
        };
        res.json(response);
        cache.cache_response(res, response, "gamemode");

    });
});

module.exports = router;