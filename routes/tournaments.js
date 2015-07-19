"use strict";
var express = require("express");
var router = express.Router();
var request = require("request");
var cheerio = require("cheerio");
var Tournament = require("../modules/tournament");
var Team = require("../modules/team");

router.get("/", function(req, res) {

    var options = {
        method: "GET",
        url: "https://oc.tc/tournaments"
    };

    request(options, function(error, response, body) {
        var data = {};

        var $ = cheerio.load(body);

        var tournaments = $("body section");

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
            var tourneyList = $(tourneys[i]);
            var currentList = tourneyList.find(".tournament-banner");
            var linkList = $(currentList[0]).attr("href");
            var imageList = $(currentList[1]).attr("src");
            var newToruney = new Tournament(linkList, imageList);
            data.past.push(newToruney);
        }

        res.json({data: data});
    });
});

router.get("/:id", function(req, res) {
    var name = req.params.id;
    var options = {
        method: "GET",
        url: "https://oc.tc/tournaments/" + name
    };

    request(options, function(error, response, body) {
        var data = {};
        var info = {};

        var $ = cheerio.load(body);

        info.url = options.url;
        info.id = name;
        info.image = $(".tournament-banner").children().first().attr("src");
        info.rules = "";

        var rules = $(".row .span12 p");
        rules.each(function(i, elm) {
            elm = $(elm);
            info.rules += elm.text();
        });

        info.rules = info.rules.escapeSpecialChars();

        info.alert = $(".row .span12 .alert").text().escapeSpecialChars();

        data.info = info;

        var teams = [];
        var list = $(".row .span12 table tbody tr");
        list.each(function(i, elm) {
            elm = $(elm);

            var cols = $(elm).children();

            var id = cols.first().text();
            var name = $(cols[1]).text().escapeSpecialChars();
            var path = $(cols[1]).find("a").attr("href");
            var leader = $(cols[2]).text().escapeSpecialChars();
            var memberCount = parseInt($(cols[3]).text());
            var members = $(cols[3]).attr("title").replace("and", " ").replace(/,/g, " ").replace(/\s\s+/g, " ");

            var status = $(cols[4]).text().escapeSpecialChars();
            var registered = $(cols[5]).text().escapeSpecialChars();

            var t = new Team(name, path, leader, memberCount, members.split(" "), id, status, registered);

            teams.push(t);
        });

        data.teams = teams;

        res.json({data: data});
    });
});


module.exports = router;