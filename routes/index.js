"use strict";
var express = require("express");
var router = express.Router();

router.get("/", function(req, res) {
	var proto = req.headers['x-forwarded-proto'] || "http";
    res.render("index", {
    	domain: proto + "://" + req.get("host")
    });
});

module.exports = router;