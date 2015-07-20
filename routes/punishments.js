"use strict";
var express = require("express");
var router = express.Router();
var parser = require("../modules/parser");
var request = require("request");
var cheerio = require("cheerio");

router.get("/", function(req, res) {
    var page = parseInt(req.query.page) || 1;

    var options = {
        method: "GET",
        url: "https://oc.tc/punishments?page=" + page
    };

    request(options, function(error, response, body) {
        if (error) {
            console.error(error);
            return res.status(500).json({
                errors: ["Unable to complete request"]
            });
        }
        var $ = cheerio.load(body);
        var pagination = $(".span12 .btn-group.pull-left");
        var pages = parser.pageCount($, pagination);

        if (page > pages) {
            return res.status(422).json({
                errors: ["Invalid page number"]
            });
        }

        var links = parser.setMeta(req, page, pages);

        var punishments = [];

        var rows = $(".span12 table tbody tr");

        for (var i = 0; i < rows.length; i++) {
            var elm = $(rows[i]);

            var cols = elm.children();

            var punisher = $(cols[0]).text().escapeSpecialChars();
            var punished = $(cols[1]).text().escapeSpecialChars();
            var reason = $(cols[2]).text().escapeSpecialChars();
            var type = $(cols[3]).text().escapeSpecialChars();
            var expires = $(cols[4]).text().escapeSpecialChars();
            var date = $(cols[5]).text().spaceSpecialChars().trim();
            if (expires === "") {
                expires = null;
            }
            var id = $(cols[5]).find("a").attr("href").match(/([0-9a-fA-F]{24})$/)[0];

            punishments.push({
                punisher: punisher,
                punished: punished,
                type: type,
                reason: reason,
                date: date,
                expires: expires,
                id: id
            });
        }



        res.json({
            links: links,
            data: punishments
        });
    });
});


router.get("/:id", function(req, res) {
    var id = req.params.id;

    var options = {
        method: "GET",
        url: "https://oc.tc/punishments/" + id
    };

    request(options, function(error, response, body) {
        if (error) {
            console.error(error);
            return res.status(500).json({
                errors: ["Unable to complete request"]
            });
        }

        var $ = cheerio.load(body);
        var links = parser.setMeta(req);

        var punished = $("h1 a").text().escapeSpecialChars();
        var date = $("h1 small").text().spaceSpecialChars().trim();

        var punisher = $(".punisher a").text();
        var reason = parser.getText($(".reason"));
        var type =  parser.getText($(".type"));

        var rows = $(".punishment .row");
        var middle = $(rows[1]);
        var middleCols = middle.children();
        var expires = parser.getText($(middleCols[0]).find("h3"));
        var server = parser.getText($(middleCols[1]).find("h3"));
        var match = $(middleCols[2]).find("h3 a");
        var map = match.text();
        var matchLink = match.attr("href");
        var matchId = matchLink.match(/([0-9a-fA-F]{24})$/)[0];

        var bottom = $(rows[2]);
        var botCols = bottom.children();
        var active = parser.getText($(botCols[1]).find("h3")).escapeSpecialChars().trim();
        if (active === "Yes") {
            active = true;
        } else {
            active = false;
        }
        var automatic = parser.getText($(botCols[2]).find("h3")).escapeSpecialChars().trim();
        if (automatic === "Yes") {
            automatic = true;
        } else {
            automatic = false;
        }

        var punishment = {
            id: id,
            punished: punished,
            punisher: punisher,
            reason: reason,
            type: type,
            date: date,
            expires: expires,
            server: server,
            match: {
                map: map,
                id: matchId
            },
            active: active,
            automatic: automatic
        };



        res.json({
            links: links,
            data: punishment
        });
    });
});

module.exports = router;