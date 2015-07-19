"use strict";
var express = require("express");
var router = express.Router();
var parser = require("../modules/parser");
var auth = require("../modules/auth");
var cheerio = require("cheerio");

router.get("/", function(req, res) {
    // move to middleware
    var login = req.headers.authorization;
    var arr;
    if (login) {
        arr = login.split(":");
    }
    if (!login || arr.length !== 2) {
        return res.status(401).json({
            errors: ["Provide login credentials"]
        });
    }

    var pass = arr[1];
    var username = arr[0];

    var page = parseInt(req.query.page) || 1;

    var options = {
        method: "GET",
        url: "https://oc.tc/alerts?page=" + page
    };

    auth.authed_req(options, username, pass, function(error, response, body) {
        if (error) {
            return res.status(error.status).json({
                errors: [error.message]
            });
        }
        var $ = cheerio.load(body);
        var rows = $(".span12 table tbody tr");
        var pagination = $(".span12 .btn-group.pull-left");
        var alerts = [];

        var pages = parser.pageCount($, pagination) || 1;

        if (page > pages) {
            return res.status(422).json({
                errors: ["Invalid page number"]
            });
        }

        var links = parser.setMeta(req, page, pages);

        for (var i = 0; i < rows.length; i++) {
            var elm = $(rows[i]);

            var cols = elm.children();

            var message = $(cols[0]).text().spaceSpecialChars().trim();
            var url = $(cols[0]).attr("href");
            var status = $(cols[1]).text().escapeSpecialChars();

            alerts.push({
                message: message,
                url: url,
                status: status
            });
        }

        res.json({
            links: links,
            data: alerts,
        });
    });
});

module.exports = router;