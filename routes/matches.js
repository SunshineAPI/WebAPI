"use strict";
var express = require("express");
var router = express.Router();
var cheerio = require("cheerio");
var helpers = require("../modules/helpers");
var parser = require("../modules/parser");
var cache = require("../modules/cache");

router.get("/:id", function(req, res) {
    var options = {
        url: "/matches/" + req.params.id,
        followAllRedirects: true
    };
    helpers.request(options, function(error, response, body) {
        var $ = cheerio.load(body);
        var match = {};
        match.map = $("body > div.container > section > div.page-header > h1 > a:nth-child(1)").text();
        match.date = $("body > div.container > section > div.page-header > h1 > small").data("original-title");
        match.server = $("body > div.container > section > div:nth-child(2) > div:nth-child(2) > h2:nth-child(1) > a").text().trim();
        match.length = $("body > div.container > section > div:nth-child(2) > div:nth-child(2) > h2:nth-child(2)").text().spaceSpecialChars().replace(" match length", "").trim();
        match.kills = parseInt($("body > div.container > section > div:nth-child(2) > div:nth-child(3) > h2").text().spaceSpecialChars().trim().split(" ").slice(0, 1).join("").replace(" kills", ""));
        match.deaths = parseInt($("body > div.container > section > div:nth-child(2) > div:nth-child(3) > h2:nth-child(2)").text().spaceSpecialChars().replace(" deaths", "").trim());
        match.most_common = $("body > div.container > section > div:nth-child(2) > div:nth-child(3) > h2:nth-child(3)").text().spaceSpecialChars().replace(" most common weapon", "").trim();
        match.least_common = $("body > div.container > section > div:nth-child(2) > div:nth-child(3) > h2:nth-child(4)").text().spaceSpecialChars().replace(" least common weapon", "").trim();
        var teamsnode = $("body > div > section > div:nth-child(4)");
        match.teams = [];
        teamsnode.children(".span4").each(function() {
            var newteam = {};
            var players = [];
            $(this).children("h4").each(function() {
                newteam.name = $(this).text().spaceSpecialChars().trim().split(" ").slice(0, 1).join("");
                newteam.won = $(this).children("span").text().spaceSpecialChars().trim();
                if (newteam.won === "") {
                    newteam.won = "Tie!";
                } else if (newteam.won === "Losing Team") {
                    newteam.won = false;
                } else if (newteam.won === "Winning Team") {
                    newteam.won = true;
                }
                newteam.count = parseInt($(this).children("small").text().spaceSpecialChars().trim());
            });
            $(this).children("a").each(function() {
                players.push($(this).attr("href").replace("/", ""));
            });
            newteam.players = players;
            match.teams.push(newteam);
        });
        var matchesResponse = {
            links: parser.setMeta(req),
            data: match
        };
        res.json(matchesResponse);
        cache.cache_response(res, matchesResponse, "match");
    });
});

module.exports = router;