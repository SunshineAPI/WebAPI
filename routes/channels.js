"use strict";
var express = require("express");
var router = express.Router();
var parser = require("../modules/parser");
var request = require("request");
var cheerio = require("cheerio");

router.get("/", function(req, res) {
    var page = parseInt(req.query.page) || 1;
    var sort = req.query.sort;
    var options = {
        method: "GET",
        url: "https://oc.tc/channels" + "?page=" + page + (sort ? "&sort=" + sort : "")
    };

    request(options, function(error, response, body) {
        var $ = cheerio.load(body);
        var pagination = $(".span12 .btn-group.pull-left");
        var max = parser.pageCount($, pagination);
        var data = {};
        var channels = [];
        data.page = page;
        data.pages = max;
        data.sort = sort || "subscribers";
        var rows = $("table tbody tr");
        for (var i = 0; i < rows.length; i++) {
            var elm = $(rows[i]);

            var children = elm.children();

            var rank = parseInt($(children[0]).text());

            var youtube = $(children[1]);
            var img = youtube.find("img").attr("src");
            var title = youtube.text().escapeSpecialChars();

            var player = $(children[2]).text().escapeSpecialChars();
            var videos = parseInt($(children[3]).text());
            var subscribers = parseInt($(children[4]).text());
            var views = parseInt($(children[5]).text());

            channels.push({
                player: player,
                rank: rank,
                youtube: {
                    channel: title,
                    thumb: img,
                    video_count: videos,
                    subscriber_count: subscribers,
                    view_count: views
                }
            });

        }
        data.channels = channels;
        res.json(data);
    });
});


module.exports = router;