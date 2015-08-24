"use strict";
var express = require("express");
var router = express.Router();
var parser = require("../modules/parser");
var cheerio = require("cheerio");
var querystring = require("querystring");
var helpers = require("../modules/helpers");
var cache = require("../modules/cache");


router.get("/", function(req, res) {
    var page = parseInt(req.query.page) || 1;
    var options = {
        method: "GET",
        url: "/leaderboard?page="+page,
        timeout:3000
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
        var players = [];
        var links = parser.setMeta(req, page, pages);



        var rows = $("body > div > section > div.row > div > table > tbody > tr");
        rows.each(function(i){
            var newPlayer = {};
            newPlayer.name = $(this).find("td:nth-child(8)").text().escapeSpecialChars();
            newPlayer.rank = parseInt($(this).find("td:nth-child(1)").text());
            newPlayer.rating = parseFloat($(this).find("td:nth-child(2)").children("strong").text());
            newPlayer.matches = parseInt($(this).find("td:nth-child(3)").text());
            newPlayer.win_loss_ratio = parseFloat($(this).find("td:nth-child(4)").text());
            newPlayer.wins = parseInt($(this).find("td:nth-child(5)").text());
            newPlayer.losses = parseInt($(this).find("td:nth-child(6)").text());
            newPlayer.forfeits = parseInt($(this).find("td:nth-child(7)").text());
            players.push(newPlayer);
        });

        var statsResponse = {
            links: links,
            data: players
        };

        res.json(statsResponse);
        //cache.cache_response(res, statsResponse, "stats");
    });
});


module.exports = router;
