"use strict";
var express = require("express");
var router = express.Router();
var parser = require("../modules/parser");
var cheerio = require("cheerio");
var helpers = require("../modules/helpers");

var regions = ["global", "all", "us", "eu"];

router.get("/rotations", function(req, res) {
    var options = {
        method: "GET",
        url: "/maps"
    };


    helpers.request(options, function(error, response, body) {
        if (error) {
            console.error(error);
            return res.status(500).json({
                errors: ["Unable to complete request"]
            });
        }

        var $ = cheerio.load(body);

        var data = {};
        var links = parser.setMeta(req);

        var servers = $(".dropdown").last().find(".dropdown-menu > li");
        var region;
        for (var i = 0; i < servers.length; i++) {
            var elm = $(servers[i]);
            if (elm.hasClass("dropdown-submenu")) {
                region = elm.children().first().text().toLowerCase();
                data[region] = [];
                continue;
            }

            var link = elm.find("a");
            var name = link.text();
            var id = link.attr("href").match(/([0-9a-fA-F]{24})$/)[0];
            data[region].push({
                name: name,
                id: id
            });
        }

        res.json({
            links: links,
            data: data
        });
    });
});


router.get("/rotations/:id", function(req, res) {
    var id = req.params.id;
    var options = {
        method: "GET",
        url: "/maps/rotation/" + id
    };


    helpers.request(options, function(error, response, body) {
        if (error) {
            console.error(error);
            return res.status(500).json({
                errors: ["Unable to complete request"]
            });
        }

        var $ = cheerio.load(body);

        var data = {};
        var links = parser.setMeta(req);

        var maps = parser.parseMapList($);
        var server = $(".dropdown .dropdown-toggle").last().text().escapeSpecialChars();

        data.rotation = {};
        data.rotation.server = server;
        data.rotation.maps = maps;

        res.json({
            links: links,
            data: data
        });
    });
});

router.get("/:region?", function(req, res) {
    var region = req.params.region || "all";
    var options = {
        method: "GET",
        url: "/play/" + region
    };

    if (regions.indexOf(region) === -1) {
        return res.status(422).json({
            errors: ["Invalid server region"]
        });
    }

    helpers.request(options, function(error, response, body) {
        if (error) {
            console.error(error);
            return res.status(500).json({
                errors: ["Unable to complete request"]
            });
        }

        var $ = cheerio.load(body);

        var meta = {};
        meta.region = region;
        var links = parser.setMeta(req);
        var servers = [];

        var serverList = $("div.thumbnail");

        serverList.each(function(i, elm) {
            elm = $(elm);
            var name = parser.getText(elm.find(".title")).trim();
            var serverRegion = elm.find(".title small");
            if (serverRegion.length) {
                serverRegion = serverRegion.text().match(/\((.*?)\)/)[1];
            } else {
                serverRegion = region;
            }
            var image = elm.find(".server-box").css("background-image")
                .match(/\((.*?)\)/)[1].replace(/('|")/g, "");
            var currentMap = elm.find(".current-map a");
            var cMapName = currentMap.text();
            var cMapId = currentMap.attr("href").replace("/maps/", "");
            var nextMap = elm.find(".next-map a");
            var nMapName;
            var nMapId;

            if (nextMap.length) {
                nMapName = nextMap.text();
                nMapId = nextMap.attr("href").replace("/maps/", "");
            }

            var playersNode = elm.find(".players");
            var online = parseInt(parser.getText(playersNode));
            var max = parseInt(playersNode.find("small").text()
                .escapeSpecialChars().match(/[0-9][0-9]*/)[0]);

            var server = {
                name: name,
                region: serverRegion,
                online_players: online,
                max_players: max,
                current_map: {
                    name: cMapName,
                    image: image,
                    id: cMapId
                }
            };

            if (nextMap.length) {
                server.next_map = {
                    name: nMapName,
                    id: nMapId
                };
            } else {
                server.next_map = null;
            }

            servers.push(server);
        });

        res.json({
            links: links,
            meta: meta,
            data: servers
        });
    });
});


module.exports = router;