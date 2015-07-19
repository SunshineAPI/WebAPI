"use strict";
var express = require("express");
var router = express.Router();
var parser = require("../modules/parser");
var request = require("request");
var cheerio = require("cheerio");

var gamemodes = ["tdm", "ctw", "ctf",
    "dtc", "blitz", "rage", "gs", "mixed"
];

router.get("/playing", function(req, res) {
    var options = {
        method: "GET",
        url: "https://oc.tc/maps"
    };

    request(options, function(error, response, body) {
        if (error) {
            console.error(error);
            return res.status(500).json({
                errors: ["Unable to complete request"]
            });
        }

        var $ = cheerio.load(body);

        var maps = parser.parseMapList($);
        var links = parser.setMeta(req);

        res.json({
            links: links,
            data: maps
        });
    });
});

router.get("/all", function(req, res) {
    var page = req.query.page || 1;
    var options = {
        method: "GET",
        url: "https://oc.tc/maps/all?page=" + page
    };

    request(options, function(error, response, body) {
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


        res.json({
            links: links,
            data: maps
        });
    });
});

router.get("/:id", function(req, res) {
    var id = req.params.id;
    var options = {
        method: "GET",
        url: "https://oc.tc/maps/" + id
    };

    request(options, function(error, response, body) {
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

        res.json({
            links: links,
            data: map
        });
    });
});

router.get("/gamemode/:gamemode", function(req, res) {
    var page = req.query.page || 1;
    var gamemode = req.params.gamemode;
    var options = {
        method: "GET",
        url: "https://oc.tc/maps/gamemode/" + gamemode + "/?page=" + page
    };

    if (gamemodes.indexOf(gamemode) === -1) {
        return res.status(422).json({
                errors: ["Invalid gamemode"]
            });
    }

    request(options, function(error, response, body) {
        var $ = cheerio.load(body);

        var data = {};
        var pagination = $(".span12 .btn-group.pull-left").first();
        var pages = parser.pageCount($, pagination);

        if (page > pages) {
            return res.status(422).json({
                errors: ["Invalid page number"]
            });
        }

        data.page = page;
        data.pages = pages;
        data.gamemode = gamemode;

        var maps = parser.parseMapList($);

        data.maps = maps;

        res.json({
            data: data
        });
    });
});

module.exports = router;