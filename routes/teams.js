"use strict";
var express = require("express");
var router = express.Router();
var cheerio = require("cheerio");
var Team = require("../modules/team");
var parser = require("../modules/parser");
var helpers = require("../modules/helpers");

// /teams?page=2
router.get("/", function(req, res) {
  var page = parseInt(req.query.page) || 1;
  var options = {
    method: "GET",
    url: "/teams" + (page ? "?page=" + page : "")
  };

  helpers.request(options, function(error, response, body) {
    if (error) {
      console.error(error);
      return res.status(500).json({
        errors: ["Unable to complete request"]
      });
    }

    var $ = cheerio.load(body);

    var pagination = $(".span12 .btn-group.pull-left");
    var pages = parser.pageCount($, pagination);

    if (page > pages) {
      return res.status(422).json({
        errors: ["Invalid page number"]
      });
    }
    var links = parser.setMeta(req, page, pages);


    var teams = [];
    var rows = $("table.table tbody tr");
    for (var i = 0; i < rows.length; i++) {
      var elm = $(rows[i]);

      var n = elm.children().first().find("a");
      var name = n.text().escapeSpecialChars();
      var id = n.attr("href").replace("/teams/", "");

      var l = $(elm.children()[1]).find("a");
      var leader = l.text().escapeSpecialChars();

      var memberCount = parseInt($(elm.children()[2]).text());
      var created = $(elm.children()[3]).text().escapeSpecialChars();

      var t = new Team(name, id, leader, memberCount, created);
      teams.push(t);
    }

    res.json({
      links: links,
      data: teams
    });
  });

});

// /teams/korea
router.get("/:team", function(req, res) {
  var team = req.params.team;
  var base = "/teams/" + team;
  var options = {
    method: "GET",
    url: base
  };

  var players = [];

  function addPlayerData(body, cb) {
    var s = cheerio.load(body);

    var rows = s("table tbody tr");

    for (var i = 0; i < rows.length; i++) {
      var elm = s(rows[i]);

      var username = elm.children().first().find("a").text().escapeSpecialChars();

      var role = s(elm.children()[1]).text().escapeSpecialChars();
      var accepted = s(elm.children()[2]).text().escapeSpecialChars();

      players.push({
        username: username,
        role: role,
        accepted: accepted
      });

      if (rows.length === i + 1) {
        cb();
      }
    }
  }

  helpers.request(options, function(error, response, body) {
    if (response.statusCode === 404 || response.statusCode === 302) {
      return res.status(404).json({
        errors: ["Team not found"]
      });
    }
    var data = {};

    var $ = cheerio.load(body);

    data.id = team;
    data.name = $("h1").text();

    var pagination = $(".span12 .btn-group.pull-left");
    var pages = parser.pageCount($, pagination) || 1;
    var links = parser.setMeta(req);

    var top = $(".span12 .span4");
    var bottom = $(".span12 .span3");

    var wools = parseInt(parser.getText($(top[0])));
    var cores = parseInt(parser.getText($(top[1])));
    var monuments = parseInt(parser.getText($(top[2])));

    var kk = parseFloat(parser.getText($(bottom[0])));
    var kd = parseFloat(parser.getText($(bottom[1])));
    var kills = parseInt(parser.getText($(bottom[2])));
    var deaths = parseInt(parser.getText($(bottom[3])));

    data.stats = {
      wools: wools,
      cores: cores,
      monuments: monuments,
      kd: kd,
      kk: kk,
      kills: kills,
      deaths: deaths
    };

    function getNextPage(page, cb) {
      options.url = base + "?page=" + page;
      helpers.request(options, function(err, response, body) {
        addPlayerData(body, function() {
          cb();
        });
      });
    }


    // using an async recursion function
    function getPlayers(callback) {
      var page = 2;
      (function addPage() {
        getNextPage(page, function() {
          if (page === pages) {
            callback();
          } else {
            page += 1;
            // use setTimeout to prevent stack overflow
            setTimeout(addPage, 0);
          }
        });
      })();
    }

    addPlayerData(body, function() {
      if (pages > 1) {
        getPlayers(function() {
          send();
        });
      } else {
        send();
      }
    });


    function send() {
      data.member_count = players.length;
      data.players = players;


      res.json({
        links: links,
        data: data
      });
    }
  });

});


module.exports = router;