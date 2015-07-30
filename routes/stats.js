"use strict";
var express = require("express");
var router = express.Router();
var parser = require("../modules/parser");
var cheerio = require("cheerio");
var querystring = require("querystring");
var helpers = require("../modules/helpers");
var cache = require("../modules/cache");

var periods = ["day", "week", "eternity"];
var games = ["all", "projectares", "blitz", "ghostsquadron"];
var sorts = ["kills", "deaths", "kd", "kk", "cores_leaked", "wool_placed", "destroyables_destroyed", "playing_time"];

router.get("/", function(req, res) {
    var page = parseInt(req.query.page) || 1;
    var sort = req.query.sort || "kills";
    var game = req.query.game || "all";
    var time = req.query.time || "day";

    if (sorts.indexOf(sort) === -1 || games.indexOf(game) === -1 || periods.indexOf(time) === -1) {
        return res.status(422).json({
            errors: ["Invalid sort options"]
        });
    }

    var query = querystring.stringify({
        page: page,
        time: time,
        game: game,
        sort: sort
    });

    var options = {
        method: "GET",
        url: "/stats?" + query,
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

        var meta = {};
        meta.time = time;
        meta.game = game;
        meta.sort = sort;

        var rows = $("table tbody tr");

        for (var i = 0; i < rows.length; i++) {
            var elm = $(rows[i]);

            var cols = elm.children();

            var place = parseInt($(cols[0]).text());
            var kills = parseInt($(cols[1]).text());
            var deaths = parseInt($(cols[3]).text());
            var kd = parseFloat($(cols[3]).text());
            var kk = parseFloat($(cols[4]).text());
            var wool_placed = parseInt($(cols[5]).text());
            var cores_leaked = parseInt($(cols[6]).text());
            var destroyables_destroyed = parseInt($(cols[7]).text());
            var playing = $(cols[8]).text().escapeSpecialChars();

            var player = $(cols[9]).text().escapeSpecialChars();

            players.push({
                player: player,
                place: place,
                playing_time: playing,
                stats: {
                    kills: kills,
                    deaths: deaths,
                    kd: kd,
                    kk: kk,
                    wools: wool_placed,
                    cores: cores_leaked,
                    monuments: destroyables_destroyed
                }
            });

        }
        var response = {
            links: links,
            meta: meta,
            data: players
        };

        res.json(response);
        cache.cache_response(res, response, "stats");
    });
});


module.exports = router;
