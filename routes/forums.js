var express = require("express");
var router = express.Router();
var parser = require("../modules/parser");
var auth = require("../modules/auth");
var request = require("request");
var cheerio = require("cheerio");
var Topic = require("../modules/topic");

router.get('/new', function(req, res) {
    var options = {
        method: 'GET',
        url: 'https://oc.tc/forums'
    };

    request(options, function(error, response, body) {
        var data = {};
        var topics = [];

        var $ = cheerio.load(body);

        var topicList = $(".span9 table tr");

        console.log(topicList)

        topicList.each(function(i, elm) {

            var topic = $(elm).children().first();
            var tdata = $(topic).find("a");
      
            var title = $(tdata[0]).text();
            var author = $(tdata[1]).text();
            var category = $(tdata[2]).text();

            var t = new Topic(title, author, category);
            topics.push(t);
        });

        data.page = 0;
        data.pages = 0;
        data.topics = topics;

        res.json(data);

    });
});


module.exports = router;