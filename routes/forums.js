"use strict";
var express = require("express");
var router = express.Router();
var parser = require("../modules/parser");
var request = require("request");
var cheerio = require("cheerio");
var auth = require("../modules/auth");

router.get("/new", function(req, res) {
    var page = parseInt(req.query.page) || 1;
    var options = {
        method: "GET",
        url: "https://oc.tc/forums" + (page ? "?page=" + page : "")
    };

    request(options, function(error, response, body) {
        parser.parseForum(body, page, "new", function(err, pages, topics) {
            if (page > pages) {
                return res.status(422).json({
                    errors: ["Invalid page number"]
                });
            }

            var links = parser.setMeta(req, page, pages);

            res.json({
                links: links,
                data: topics
            });
        });
    });
});

router.get("/categories", function(req, res) {
    var options = {
        method: "GET",
        url: "https://oc.tc/forums/"
    };

    request(options, function(error, response, body) {
        var categories = [];
        var $ = cheerio.load(body);
        var links = parser.setMeta(req);

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
            categories.push(cat);
        });
        res.json({
            links: links,
            data: categories
        });

    });
});

router.get("/:id", function(req, res) {
    var id = req.params.id;
    var page = parseInt(req.query.page) || 1;
    var options = {
        method: "GET",
        url: "https://oc.tc/forums/" + id + (page ? "?page=" + page : "")
    };

    request(options, function(error, response, body) {
        if (response.statusCode === 404) {
            return res.status(404).json({
                errors: ["Forum category not found"]
            });
        }
        parser.parseForum(body, page, id, function(err, pages, topics, $) {
            if (error || err) {
                return res.status(500).json({
                    errors: ["Unable to complete request"]
                });
            }
            var c = $("#forum-sidebar .active a");
            if (page > pages) {
                return res.status(422).json({
                    errors: ["Invalid page number"]
                });
            }
            var links = parser.setMeta(req, page, pages);
            var meta = {};
            meta.category = {
                name: c.text().escapeSpecialChars(),
                id: id,
                parent: {
                    name: c.parent().parent().prev().text()
                }
            };

            res.json({
                links: links,
                meta: meta,
                data: topics
            });
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
        var $ = cheerio.load(body);

        var pagination = $(".span9 .btn-group.pull-left");
        var pages = parser.pageCount($, pagination) || 1;

        if (page > pages) {
            return res.status(422).json({
                errors: ["Invalid page number"]
            });
        }
        var links = parser.setMeta(req, page, pages);

        var topic = parser.parseForumTopic($, id);

        res.json({
            links: links,
            data: topic
        });
    });
});

router.get("/posts/:id", function(req, res) {
    var id = req.params.id;
    var page = parseInt(req.query.page) || 1;
    var options = {
        method: "GET",
        url: "https://oc.tc/forums/posts/" + id + (page ? "?page=" + page : "")
    };

    request(options, function(error, response, body) {
        if (response.statusCode === 404) {
            return res.status(404).json({
                errors: ["Post not found"]
            });
        }
        var $ = cheerio.load(body);

        var pagination = $(".span9 .btn-group.pull-left");
        var pages = parser.pageCount($, pagination) || 1;

        if (page > pages) {
            return res.status(422).json({
                errors: ["Invalid page number"]
            });
        }

        var node = $(".span9 > div[id=" + id + "]");

        var post = parser.parsePost($, node);

        var links = parser.setMeta(req, page, pages);

        res.json({
            links: links,
            data: post
        });
    });
});


router.post("/topics/:section", auth.authorize, function(req, res) {
    var key = req.params.section;
    

    var options = {
        method: "POST",
        url: "https://oc.tc/forums/" + key + "/create",
        headers: {
            "content-type": "x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36"
        },
        formData: {
            "utf8": "✓",
            "topic[subject]": req.body.topic,
            "topic[posts_attributes][0][text]": req.body.contents,
            "topic[posts_attributes][0][converted]": "true",
            "commit": "Create Topic"
        }
    };

    auth.authed_req(options, req.authorization.cookie, function(error, response, body) {
        if (error) {
            return res.status(error.status).json({
                errors: [error.message]
            });
        }
        var $ = cheerio.load(body);
        var erro = $("body > div > div.flash > div").text();
        if (!erro) {
            res.send("Success!");
        } else {
            res.status(500).send("Failed,try again soon");
        }
    });
});


router.post("/reply/:topic", function(req, res) {
    var topic = req.params.topic;

    var options = {
        method: "POST",
        url: "https://oc.tc/forums/topics/" + topic + "/posts",
        headers: {
            "content-type": "x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36"
        },
        formData: {
            "utf8": "✓",
            "post[text]": req.body.contents,
            "post[converted]": "true",
            "commit": "Reply"
        }
    };

    auth.authed_req(options, req.authorization.cookie, function(error, response, body) {
        if (error) {
            return res.status(error.status).json({
                errors: [error.message]
            });
        }
        var $ = cheerio.load(body);
        var erro = $("body > div > div.flash > div").text();
        if (!erro) {
            res.send("Success!");
        } else {
            res.status(500).send("Failed,try again soon");
        }
    });
});

router.post("/quotes/:topic", auth.authorize, function(req, res) {
    var key = req.params.topic;
    var options = {
        method: "POST",
        url: "https://oc.tc/forums/topics/" + key + "/posts",
        headers: {
            "content-type": "x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36"
        },
        formData: {
            "utf8": "✓",
            "post[text]": req.body.contents,
            "post[converted]": "true",
            "post[reply_to_id]": req.body.parentpost,
            "commit": "Reply"
        }
    };

    auth.authed_req(options, req.authorization.cookie, function(error, response, body) {
        if (error) {
            return res.status(error.status).json({
                errors: [error.message]
            });
        }
        var $ = cheerio.load(body);
        var erro = $("body > div > div.flash > div").text();
        if (!erro) {
            res.send("Success!");
        } else {
            res.status(500).send("Failed, try again soon");
        }
    });
});

module.exports = router;