"use strict";
var express = require("express");
var router = express.Router();
var parser = require("../modules/parser");

router.get("/:player", function(req, res) {
    var player = req.params.player;
    if (player.length > 16) {
        return res.status(422).json({errors: ["Invalid player"]});
    }
    parser.scrapeFromProfile(player, function(user, status) {
        if (user) {
            var links = parser.setMeta(req);
            res.json({links: links, data: user});
        } else {
            res.status(404).json({errors: ["Player not found"]});
        }
    });
});


module.exports = router;