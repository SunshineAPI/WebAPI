var express = require("express");
var router = express.Router();
var parser = require("../modules/parser");
var auth = require("../modules/auth");
var request = require("request");
var cheerio = require("cheerio");
var Topic = require("../modules/topic");

router.get('/new/:page?', function(req, res) {
    var page = req.params.page;
    if (page) {
        page = "?page=" + page;
    } else {
        page = "";
    }
    var options = {
        method: 'GET',
        url: 'https://oc.tc/forums' + page
    };

    request(options, function(error, response, body) {
        var data = {};
        var topics = [];

        var $ = cheerio.load(body);

        var topicList = $(".span9 table tbody tr");


        topicList.each(function(i, elm) {

            elm = $(elm);

            var topic = elm.children()[0];
            var tdata = $(topic).find("a");
      
            var title = $(tdata[0]).text();
            var author = $(tdata[1]).text();
            var category = $(tdata[2]).text().trim();

            var latest = elm.children()[1];
            tdata = $(latest).find("a");
      
            var latestAuthor = $(tdata[1]).text();
            var latestTimestamp = $(tdata[2]).text();


            var posts = $(elm.children()[2]);
            posts = $(posts.children()[0]).text();
            var views = $(elm.children()[3]);
            views = $(views.children()[0]).text();
           

            var t = new Topic(title, author, category, latestAuthor, latestTimestamp, posts, views);
            topics.push(t);
        });

        var pagination = $(".span9 .btn-group.pull-left").first();


        var pos = $(pagination).find(".disabled");
    

        var curPage;
        var maxPage;

        for (var i = 0; i < pos.length; i++) {
            var elm = $(pos[i]);
            var text = elm.text()
            if (text !== "…") {
                curPage = parseInt(text);
                break;
            }
        }

        var last = $(pagination).children().last();

        if ($(last).attr("href")) {
            maxPage = parseInt($(last).attr("href").split("?page=")[1]);
        } else {
            maxPage = parseInt($(last).text());
        }

        data.page = curPage;
        data.pages = maxPage;
        data.topics = topics;

        res.json(data);

    });
});


module.exports = router;