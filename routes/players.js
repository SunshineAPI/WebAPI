"use strict";
var express = require("express");
var router = express.Router();
var parser = require("../modules/parser");

router.get("/:player", function(req, res) {
    var player = req.params.player;
    if (player.length > 16) {
        return res.status(422).send("422 unprocessable player");
    }
    parser.scrapeFromProfile(player, function(user, status) {
        if (user) {
            res.json(user);
        } else {
            res.status(status).send("404 player not found");
        }
    });
});


module.exports = router;