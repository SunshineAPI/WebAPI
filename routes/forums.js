"use strict";
var express = require("express");
var router = express.Router();
var parser = require("../modules/parser");
var request = require("request");
var cheerio = require("cheerio");

router.get("/new", function(req, res) {
    var page = parseInt(req.query.page) || 1;
    var options = {
        method: "GET",
        url: "https://oc.tc/forums" + (page ? "?page=" + page : "")
    };

    request(options, function(error, response, body) {
        var data = {};
        parser.parseForum(body, page, "new", function(err, pages, topics) {
            if (err) {
                return res.status(422).send(err);
            }
            data.page = page;
            data.pages = pages;
            data.topics = topics;

            res.json(data);
        });
    });
});

router.get("/categories", function(req, res) {
    var options = {
        method: "GET",
        url: "https://oc.tc/forums/"
    };

    request(options, function(error, response, body) {
        var data = {};
        data.categories = [];
        var $ = cheerio.load(body);

        var sidebar = $("#forum-sidebar");

        sidebar.find(".nav-list").each(function(i, elm) {
            elm = $(elm);
            var cat = {};
            if (elm.prev().length) {
                cat.name = elm.prev().text().escapeSpecialChars();
            } else {
                cat.name = "General";
            }
            cat.sub_categories = [];

            var sub = elm.find("li a");
            sub.each(function(i, s) {
                s = $(s);
                var id = s.attr("href").match(/([0-9a-fA-F]{24})$/);
                cat.sub_categories.push({
                    name: s.text().escapeSpecialChars(),
                    id: (id ? id[0] : null)
                });
            });
            data.categories.push(cat);
        });
        res.json(data);


    });
});

router.get("/:oid", function(req, res) {
    var oid = req.params.oid;
    var page = parseInt(req.query.page) || 1;
    var options = {
        method: "GET",
        url: "https://oc.tc/forums/" + oid + (page ? "?page=" + page : "")
    };

    request(options, function(error, response, body) {
        var data = {};
        parser.parseForum(body, page, oid, function(err, pages, topics, $) {
            if (err) {
                return res.status(422).send(err);
            }
            var c = $("#forum-sidebar .active a");
            data.page = page;
            data.pages = pages;
            data.category = {
                name: c.text().escapeSpecialChars(),
                id: oid,
                parent: {
                    name: c.parent().parent().prev().text()
                }
            };
            data.topics = topics;

            res.json(data);
        });
    });
});


router.get("/topics/:id", function(req, res) {
    var id = req.params.id;
    var page = parseInt(req.query.page) || 1;
    var options = {
        method: "GET",
        url: "https://oc.tc/forums/topics/" + id + (page ? "?page=" + page : "")
    };

    request(options, function(error, response, body) {
        var data = {};
        
        var $ = cheerio.load(body);

        // move to parser
        function getText(elm) {
            elm = $(elm);
            return elm.contents().filter(function() {
                return this.type === "text";
            }).text().escapeSpecialChars();
        }

        var pagination = $(".span9 .btn-group.pull-left");
        var pages = parser.pageCount($, pagination) || 1;

        if (page > pages) {
            res.status(422).send("invalid page number");
        }

        var header = $(".page-header > h3");
        var title = getText(header).escapeSpecialChars();
        var creator = header.find("a").text();

        data.page = page;
        data.pages = pages;
        var t = {
            id: id,
            title: title,
            author: creator
        };
        data.topic = t;

        var posts = [];
        var rows = $(".span9 > div[id]");

        for (var i = 0; i < rows.length; i++) {
            var post = $(rows[i]);
            var postId = post.attr("id");

            var content = post.find(".post-content").html().spaceSpecialChars().trim();

            var info = post.find(".span9 > .pull-left a:not(.label)");
            var author = $(info[1]).text().escapeSpecialChars();
            var change = $(info[2]).text().spaceSpecialChars().trim();
        
            var p = {
                id: postId,
                content: content,
                author: author,
                timestamp: change
            };

            var quote = post.find("blockquote");
            if (quote.length) {
                var qInfo = quote.find("span");
                var qAuthor = $(qInfo[0]).text();
                var qTimestamp = $(qInfo[1]).text();
                var qContent = quote.find(".collapse").html().spaceSpecialChars().trim();
                var qId = quote.find(".collapse").attr("id").match(/([0-9a-fA-F]{24})$/)[0];
                p.quoting = {
                    id: qId,
                    author: qAuthor,
                    timestamp: qTimestamp,
                    content: qContent,
                };
            }

            posts.push(p);
        }

        data.posts = posts;
        res.json(data);
    });
});



module.exports = router;