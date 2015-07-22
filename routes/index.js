"use strict";
var express = require("express");
var router = express.Router();

router.get("/", function(req, res) {
	console.log(req.secure, "SECURE", req.protocol, req.headers['x-forwarded-proto']);
    res.render("index", {
    	domain: "http" + (req.secure ? "s" : "") + "://" + req.get("host")
    });
});

module.exports = router;