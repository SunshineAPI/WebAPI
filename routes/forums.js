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