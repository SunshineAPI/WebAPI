"use strict";
var express = require("express");
var router = express.Router();
var cheerio = require("cheerio");
var auth = require("../modules/auth");
var parser = require("../modules/parser");
var cache = require("../modules/cache");

var getFriendStatus = function(player, authe, cb) {
    var options = {
        method: "GET",
        url: "/" + player,
        headers: {
            "content-type": "x-www-form-urlencoded",
        }
    };
    auth.authed_req(options, authe, function(error, response, body) {
        var $ = cheerio.load(body);
        var potential = $("body > div > section:nth-child(2) > div.page-header > h1 > div > a").text();
        if (potential.contains("is your")) {
            return cb("friends", body);
        } else if (potential.contains("Friend request sent")) {
            return cb("sent", body);
        } else {
            return cb("no", body);
        }

    });
};

var opts = {
    method: "GET",
    url: "/friendships",
    headers: {
        "content-type": "x-www-form-urlencoded",
    }
};

router.get("/all", auth.authorize, function(req, res) {

    auth.authed_req(opts, req.authorization.cookie, function(error, response, body) {
        if (error) {
            return res.status(error.status).json({
                errors: [error.message]
            });
        }
        var all = [];
        var $ = cheerio.load(body);
        var allfriends = $(".friend-icon");
        allfriends.each(function(i) {
            all[i] = $(this).children(".thumbnail").attr("href").substring(1, $(this).children(".thumbnail").attr("href").length);
        });
        res.json({
            links: parser.setMeta(req),
            data: all
        });
    });
});

router.get("/offline", auth.authorize, function(req, res) {
    auth.authed_req(opts, req.authorization.cookie, function(error, response, body) {
        if (error) {
            return res.status(error.status).json({
                errors: [error.message]
            });
        }
        var all = [];
        var $ = cheerio.load(body);
        var allfriends = $(".span1");
        allfriends.each(function(i) {
            all[i] = $(this).children(".thumbnail").attr("href").substring(1, $(this).children(".thumbnail").attr("href").length);
        });
        res.json({
            links: parser.setMeta(req),
            data: all
        });
    });

});

router.get("/online", auth.authorize, function(req, res) {
    auth.authed_req(opts, req.auhorization.cookie, function(error, response, body) {
        if (error) {
            return res.status(error.status).json({
                errors: [error.message]
            });
        }
        var all = [];
        var $ = cheerio.load(body);
        var allfriends = $(".span2");
        allfriends.each(function(i) {
            all[i] = $(this).children(".thumbnail").attr("href").substring(1, $(this).children(".thumbnail").attr("href").length);
        });
        res.json({
            links: parser.setMeta(req),
            data: all
        });
    });
});

router.post("/add/:player", auth.authorize, function(req, res) {
    getFriendStatus(req.params.player, req.authorization.cookie, function(status, body) {
        var $ = cheerio.load(body);
        var header = $(".page-header");
        var aelem = header.children("h1").children("a");
        if (status === "friends") {
            res.status(400).json({
                errors: ["Already a friend"]
            });
        } else if (status === "sent") {
            res.status(400).json({
                errors: ["Already sent friend request"]
            });
        } else {
            var link = aelem.attr("href");
            var requestoptions = {
                method: "POST",
                url: link,
                headers: {
                    "content-type": "x-www-form-urlencoded",
                },
                formdata: {
                    "_method": "post"
                }

            };
            auth.authed_req(requestoptions, req.authorization.cookie, function(error, response) {
                if (error || response.statusCode === 500) {
                    return res.status(error.status).json({
                        errors: [error.message]
                    });
                }
                res.status(400).json({
                    links: parser.setMeta(req),
                    data: {
                        status: "requested"
                    }
                });
            });
        }
    });

});

module.exports = router;