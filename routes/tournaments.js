var express = require("express");
var router = express.Router();
var request = require("request");
var cheerio = require("cheerio");
var Tournament = require("../modules/tournament")

router.get('/', function(req, res) {

    var options = {
        method: 'GET',
        url: 'https://oc.tc/tournaments'
    };

    request(options, function(error, response, body) {
        var data = {};

        var $ = cheerio.load(body);

        var tournaments = $("body section");
        var links = tournaments.find(".row");

        var headers = tournaments.find(".page-header");
        var tourneys = tournaments.find(".row");
        var i = 0;
        if (headers.length > 1) {
            i = 1;
            var current = $(tournaments).find(".tournament-banner");
            var link = $(current[0]).attr("href");
            var image = $(current[1]).attr("src");
            var tourney = new Tournament(link, image);
            data.current = tourney;
        }
        data.past = [];
        for (i; i < tourneys.length; i++) {
            var tourney = $(tourneys[i]);
            var current = tourney.find(".tournament-banner");
            var link = $(current[0]).attr("href");
            var image = $(current[1]).attr("src");
            var tourney = new Tournament(link, image);
            data.past.push(tourney);
        }

        res.json(data);
    });
});


module.exports = router;