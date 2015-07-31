"use strict";
var express = require("express");
var router = express.Router();
var parser = require("../modules/parser");
var auth = require("../modules/auth");
var cache = require("../modules/cache");

/*
    Post email and password registered to Overcast
    to be returned with a hash of the username and
    password that can be used to lookup the cookie,
    rather than rehashing the username and password
    for every authenticated request.
 */
router.post("/auth", function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    if (!email || !password) {
        return res.status(422).json({
            errors: ["Provide authorization header"]
        });
    }

    auth.getCookie(email, password, function(error, cookie, hash) {
        if (error && error === 401) {
            return res.status(401).json({
                errors: ["Invalid email or password"]
            });
        } else if (error) {
            return res.status(500).json({
                errors: ["Unable to login to the Overcast Network"]
            });
        }

        res.json({
            token: hash
        });
    });
});


router.get("/:player", function(req, res) {
    var player = req.params.player;
    if (player.length > 16) {
        return res.status(422).json({
            errors: ["Invalid player"]
        });
    }
    parser.parseProfile(player, function(user, status) {
        if (user) {
            var links = parser.setMeta(req);
            var playerResponse = {
                links: links,
                data: user
            };
            res.json(playerResponse);
            cache.cache_response(res, playerResponse, "player");
        } else {
            res.status(status || 404).json({
                errors: ["Player not found"]
            });
        }
    });
});

module.exports = router;