"use strict";
var express = require("express");
var router = express.Router();
var cheerio = require("cheerio");
var parser = require("../modules/parser");
var helpers = require("../modules/helpers");
var cache = require("../modules/cache");

router.get("/", function(req, res) {
    var options = {
        method: "GET",
        url: "/staff"
    };

    helpers.request(options, function(error, response, body) {
        if (error) {
            console.error(error);
            return res.status(500).json({
                errors: ["Unable to complete request"]
            });
        }

        var $ = cheerio.load(body);

        var groups = $(".staff-group");
        var links = parser.setMeta(req);
        var staff = [];

        for (var i = 0; i < groups.length; i++) {
            var group = $(groups[i]);
            var header = group.find("h2");
            var title = parser.getText(header).escapeSpecialChars();
            var color = header.css("color");
            var members = [];

            var thumbs = group.find(".thumbnail div.staff-caption");

            for (var x = 0; x < thumbs.length; x++) {
                var elm = $(thumbs[x]);
                members.push(elm.text().escapeSpecialChars());
            }

            staff.push({
                title: title,
                color: color,
                members: members
            });
        }


        var staffResponse = {
            links: links,
            data: staff
        };
        res.json(staffResponse);
        cache.cache_response(res, staffResponse, "staff");
    });
});

module.exports = router;