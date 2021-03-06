"use strict";
var express = require("express");
var router = express.Router();
var parser = require("../modules/parser");
var cheerio = require("cheerio");
var auth = require("../modules/auth");
var helpers = require("../modules/helpers");
var cache = require("../modules/cache");

router.get("/new", function(req, res) {
    var page = parseInt(req.query.page) || 1;
    var options = {
        method: "GET",
        url: "/forums" + (page ? "?page=" + page : "")
    };

    helpers.request(options, function(error, response, body) {
        parser.parseForum(body, page, "new", function(err, pages, topics) {
            if (page > pages) {
                return res.status(422).json({
                    errors: ["Invalid page number"]
                });
            }

            var links = parser.setMeta(req, page, pages);

            var newResponse = {
                links: links,
                data: topics
            };
            res.json(newResponse);
            cache.cache_response(res, newResponse, "forums_new");
        });
    });
});

router.get("/categories", function(req, res) {
    var options = {
        method: "GET",
        url: "/forums/"
    };

    helpers.request(options, function(error, response, body) {
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
        var catsResponse = {
            links: links,
            data: categories
        };
        res.json(catsResponse);
        cache.cache_response(res, catsResponse, "categories");
    });
});

router.get("/:id", function(req, res) {
    var id = req.params.id;
    var page = parseInt(req.query.page) || 1;
    var options = {
        method: "GET",
        url: "/forums/" + id + (page ? "?page=" + page : "")
    };

    helpers.request(options, function(error, response, body) {
        if (response.statusCode === 404) {
            return res.status(404).json({
                errors: ["Forum category not found"]
            });
        }
        if (error) {
            return res.status(500).json({
                errors: ["Unable to complete request"]
            });
        }
        parser.parseForum(body, page, id, function(err, pages, topics, $) {
            if (page > pages) {
                return res.status(422).json({
                    errors: ["Invalid page number"]
                });
            }
            var c = $("#forum-sidebar .active a");
            var links = parser.setMeta(req, page, pages);
            var meta = {};
            meta.category = {
                name: c.text().escapeSpecialChars(),
                id: id,
                parent: {
                    name: c.parent().parent().prev().text()
                }
            };
            var catResponse = {
                links: links,
                meta: meta,
                data: topics
            };
            res.json(catResponse);
            cache.cache_response(res, catResponse, "category");
        });
    });
});


router.get("/topics/:id", function(req, res) {
    var id = req.params.id;
    var page = parseInt(req.query.page) || 1;
    var options = {
        method: "GET",
        url: "/forums/topics/" + id + (page ? "?page=" + page : "")
    };

    helpers.request(options, function(error, response, body) {
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

        var topicResponse = {
            links: links,
            data: topic
        };
        res.json(topicResponse);
        cache.cache_response(res, topicResponse, "topic");
    });
});

router.get("/posts/:id", function(req, res) {
    var id = req.params.id;
    var page = parseInt(req.query.page) || 1;
    var options = {
        method: "GET",
        url: "/forums/posts/" + id + (page ? "?page=" + page : "")
    };

    helpers.request(options, function(error, response, body) {
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

        var postResponse = {
            links: links,
            data: post
        };
        res.json(postResponse);
        cache.cache_response(res, postResponse, "post");
    });
});

router.post("/topics/:category", auth.authorize, function(req, res) {
    var key = req.params.category;


    var options = {
        method: "POST",
        url: "/forums/" + key + "/create",
        headers: {
            "content-type": "x-www-form-urlencoded"
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
            res.status(201).json({
                links: parser.setMeta(req),
                data: {
                    status: "created"
                }
            });
        } else {
            res.status(500).json({
                errors: ["Failed to complete the forum post"]
            });
        }
    });
});


router.post("/topics/:topic/reply", function(req, res) {
    var topic = req.params.topic;

    var options = {
        method: "POST",
        url: "/forums/topics/" + topic + "/posts",
        headers: {
            "content-type": "x-www-form-urlencoded",
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
            res.status(201).json({
                links: parser.setMeta(req),
                data: {
                    status: "created"
                }
            });
        } else {
            res.status(500).json({
                errors: ["Failed to complete the forum post"]
            });
        }
    });
});

router.post("/topics/:topic/:id/quote", auth.authorize, function(req, res) {
    var key = req.params.topic;
    var options = {
        method: "POST",
        url: "/forums/topics/" + key + "/posts",
        headers: {
            "content-type": "x-www-form-urlencoded"
        },
        formData: {
            "utf8": "✓",
            "post[text]": req.body.contents,
            "post[converted]": "true",
            "post[reply_to_id]": req.params.id,
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
            res.status(201).json({
                links: parser.setMeta(req),
                data: {
                    status: "created"
                }
            });
        } else {
            res.status(500).json({
                errors: ["Failed to complete the forum post"]
            });
        }
    });
});

module.exports = router;