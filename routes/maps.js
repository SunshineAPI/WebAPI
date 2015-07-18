var express = require("express");
var router = express.Router();
var parser = require("../modules/parser");
var request = require("request");
var cheerio = require("cheerio");

router.get('/playing', function(req, res) {
    var options = {
        method: 'GET',
        url: 'https://oc.tc/maps'
    };

    request(options, function(error, response, body) {
        var $ = cheerio.load(body);

        var data = {};

        var maps = [];
        var list = $("div.map.thumbnail");

        list.each(function(i, elm) {
            elm = $(elm);

            var image = elm.find("img").attr("src");
            var shortId = elm.attr("id");
            var title = elm.find("h1.lead a");
            var longId = title.attr("href").replace("/maps/", "");
            var name = title.text();
            var authorNodes = elm.find("small a");
            var authors = [];
            authorNodes.each(function(i, e) {
                authors.push($(e).text());
            });
            var rating = elm.find("> div:nth-child(2) > div[title]");
            console.log(rating);
            rating = rating.attr("title").match(/([0-9]+\.[0-9][0-9]?)/)[0];
            rating = parseFloat(rating);

            maps.push({
                name: name,
                short_id: shortId,
                long_id: longId,
                image: image,
                rating: rating,
                authors: authors
            });
        });

        data.maps = maps;

        res.json(data);
    });
});



module.exports = router;