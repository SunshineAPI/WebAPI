var express = require("express");
var router = express.Router();
var parser = require("../modules/parser");
var auth = require("../modules/auth");
var request = require("request");
var cheerio = require("cheerio");
var Topic = require("../modules/topic");
var paser = require("../modules/parser")

router.get('/new', function(req, res) {
    var page = parseInt(req.query.page) || 1;
    var options = {
        method: 'GET',
        url: 'https://oc.tc/forums' + (page ? "?page=" + page : "")
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

router.get('/categories', function(req, res) {
    var options = {
        method: 'GET',
        url: 'https://oc.tc/forums/'
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
            })
            data.categories.push(cat);
        });
        res.json(data);


    });
});

router.get('/:oid', function(req, res) {
    var oid = req.params.oid;
    var page = parseInt(req.query.page) || 1;
    var options = {
        method: 'GET',
        url: 'https://oc.tc/forums/' + oid + (page ? "?page=" + page : "")
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
            }
            data.topics = topics;

            res.json(data);
        });
    });
});



module.exports = router;