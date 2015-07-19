var express = require("express");
var router = express.Router();
var parser = require("../modules/parser");
var request = require("request");
var cheerio = require("cheerio");

var gamemodes = ["tdm", "ctw", "ctf",
    "dtc", "blitz", "rage", "gs", "mixed"
];

router.get('/playing', function(req, res) {
    var options = {
        method: 'GET',
        url: 'https://oc.tc/maps'
    };

    request(options, function(error, response, body) {
        var $ = cheerio.load(body);

        var data = {};

        var maps = parser.parseMapList($);

        data.maps = maps;

        res.json(data);
    });
});

router.get('/all', function(req, res) {
    var page = req.query.page || 1;
    var options = {
        method: 'GET',
        url: 'https://oc.tc/maps/all?page=' + page
    };

    request(options, function(error, response, body) {
        var $ = cheerio.load(body);

        var data = {};
        var pagination = $(".span12 .btn-group.pull-left").first();
        var pages = parser.pageCount($, pagination);

        if (page > pages) {
            return res.status(422).send("invalid page number");
        }

        data.page = page;
        data.pages = pages;

        var maps = parser.parseMapList($);

        data.maps = maps;

        res.json(data);
    });
});

router.get('/gamemode/:gamemode', function(req, res) {
    var page = req.query.page || 1;
    var gamemode = req.params.gamemode;
    var options = {
        method: 'GET',
        url: 'https://oc.tc/maps/gamemode/' + gamemode +'/?page=' + page
    };

    if (gamemodes.indexOf(gamemode) === -1) {
        return res.status(422).send("invalid gamemode");
    }

    request(options, function(error, response, body) {
        var $ = cheerio.load(body);

        var data = {};
        var pagination = $(".span12 .btn-group.pull-left").first();
        var pages = parser.pageCount($, pagination);

        if (page > pages) {
            return res.status(422).send("invalid page number");
        }

        data.page = page;
        data.pages = pages;
        data.gamemode = gamemode;

        var maps = parser.parseMapList($);

        data.maps = maps;

        res.json(data);
    });
});




module.exports = router;