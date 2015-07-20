"use strict";
var express = require("express");
var router = express.Router();
var auth = require("../modules/auth");
var cheerio = require("cheerio");

router.post("/:section", function(req, res) {
    // move to middleware
    var login = req.headers.authorization;
    var key = req.params.section;
    var arr;
    if (login) {
        arr = login.split(":");
    }
    if (!login || arr.length !== 2) {
        return res.status(401).json({
            errors: ["Provide login credentials"]
        });
    }

    var pass = arr[1];
    var username = arr[0];



    var options = {
        method: "POST",
        url: "https://oc.tc/forums/" + key + "/create",
        headers: {
            "content-type": "x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36"
        },
        formData: {
            "utf8": "✓",
            "topic[subject]": req.body.topic,
            "topic[posts_attributes][0][text]": req.body.contents,
            "topic[posts_attributes][0][converted]": "true",
            "commit": "Create Topic"
        }
    };

    auth.authed_req(options, username, pass, function(error, response, body) {
        if (error) {
            return res.status(error.status).json({
                errors: [error.message]
            });
        }
        var $ = cheerio.load(body);
        var erro = $("body > div > div.flash > div").text();
        if (!erro) {
            res.send("Success!");
        } else {
            res.status(500).send("Failed,try again soon");
        }
    });
});

module.exports = router;