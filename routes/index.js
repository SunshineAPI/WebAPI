"use strict";
var express = require("express");
var router = express.Router();

router.get("/", function(req, res) {
    res.render("index", {
    	domain: "http" + (req.secure ? "s" : "") + "://" + req.get("host")
    });
});

module.exports = router;