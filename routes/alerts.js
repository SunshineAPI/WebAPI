"use strict";
var express = require("express");
var router = express.Router();
var parser = require("../modules/parser");
var auth = require("../modules/auth");
var cheerio = require("cheerio");
var cache = require("../modules/cache");

router.get("/", auth.authorize, function(req, res) {
    
    var page = parseInt(req.query.page) || 1;

    var options = {
        method: "GET",
        url: "/alerts?page=" + page
    };

    auth.authed_req(options, req.authorization.cookie, function(error, response, body) {
        if (error) {
            return res.status(500).json({
                errors: ["Unable to complete request"]
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

        var response = {
            links: links,
            data: alerts,
        }
        res.json(response);
        // need to implement caching for authed endpoints
        //cache.cache_response(res, response, "alerts");
    });
});

module.exports = router;