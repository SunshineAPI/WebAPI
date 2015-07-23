"use strict";
var express = require("express");
var router = express.Router();
var cheerio = require("cheerio");
var auth = require("../modules/auth");
var request = require("request");

router.get("/all", auth.authorize, function(req, res) {
    var options = {
        method: "GET",
        url: "https://oc.tc/friendships",
        headers: {
            "content-type": "x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36"
        }

    };

    auth.authed_req(options, req.authorization.cookie, function(error, response, body) {
        if (error) {
            return res.status(error.status).json({
                errors: [error.message]
            });
        }
        var all = [];
        var $ = cheerio.load(body);
        var allfriends = $(".friend-icon");
        allfriends.each(function(i, elem) {
            all[i] = $(this).children(".thumbnail").attr("href").substring(1, $(this).children(".thumbnail").attr("href").length);
        });
        res.json(all);
    });
});

router.get("/offline", auth.authorize, function(req, res) {
    var options = {
        method: "GET",
        url: "https://oc.tc/friendships",
        headers: {
            "content-type": "x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36"
        }

    };

    auth.authed_req(options, req.authorization.cookie, function(error, response, body) {
        if (error) {
            return res.status(error.status).json({
                errors: [error.message]
            });
        }
        var all = [];
        var $ = cheerio.load(body);
        var allfriends = $(".span1");
        allfriends.each(function(i, elem) {
            all[i] = $(this).children(".thumbnail").attr("href").substring(1, $(this).children(".thumbnail").attr("href").length);
        });
        res.json(all);
    });

});
router.get("/online", auth.authorize, function(req, res) {
    var options = {
        method: "GET",
        url: "https://oc.tc/friendships",
        headers: {
            "content-type": "x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36"
        }

    };

    auth.authed_req(options, req.auhorization.cookie, function(error, response, body) {
        if (error) {
            return res.status(error.status).json({
                errors: [error.message]
            });
        }
        var all = [];
        var $ = cheerio.load(body);
        var allfriends = $(".span2");
        allfriends.each(function(i, elem) {
            all[i] = $(this).children(".thumbnail").attr("href").substring(1, $(this).children(".thumbnail").attr("href").length);
        });
        res.json(all);
    });
});

router.post("/add/:player",auth.authorize,function(req,res){
    console.log("https://oc.tc/" + req.params.player);
    var options = {
        method: "GET",
        url: "https://oc.tc/" + req.params.player,
        headers: {
            "content-type": "x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36"
        }

    };

   auth.authed_req(options,req.authorization.cookie,function(error, response, body){ 
       if (error) {
            return res.status(error.status).json({
                errors: [error.message]
            });
        }
        
        var $ = cheerio.load(body);
        var header = $(".page-header");
        var aelem = header.children("h1").children("a");
        if(!aelem){
            return res.send("Already a friend");
        }
        var link = aelem.attr("href");
        console.log(link);
        var requestoptions = {
            method: "POST",
            url:"https://oc.tc"+link, 
        headers: {
            "content-type": "x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36"
        },
        formdata:{
            "_method":"post"
        }

        };
        auth.authed_req(requestoptions,req.authorization.cookie,function(error, response, body) {
            if (error) {
            return res.status(error.status).json({
                errors: [error.message]
            });
        }
        res.send("Success");
        });
       
    });
});



module.exports = router;