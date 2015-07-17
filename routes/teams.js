var express = require("express");
var router = express.Router();
var request = require("request");
var cheerio = require("cheerio");
var Team = require("../modules/team");

// /teams?page=2
router.get('/', function(req, res) {
  var page = parseInt(req.query.page) || 1;
  var options = {
    method: 'GET',
    url: 'https://oc.tc/teams/' + (page ? "?page=" + page : "")
  };

  request(options, function(error, response, body) {
    var data = {};

    var $ = cheerio.load(body);

    data.page = page || 1;

    var maxPage;
    var pagination = $(".span12 .btn-group.pull-left");
    var last = $(pagination).children().last();
    if ($(last).attr("href")) {
      maxPage = parseInt($(last).attr("href").split("?page=")[1]);
    } else {
      maxPage = parseInt($(last).text());
    }

    if (page > maxPage) {
      return res.status(422).send("Invalid page number");
    }

    data.pages = maxPage;

    data.teams = [];
    var rows = $("table.table tbody tr");
    for (var i = 0; i < rows.length; i++) {
      var elm = $(rows[i]);

      var n = elm.children().first().find("a");
      var name = n.text().escapeSpecialChars();
      var path = n.attr("href");

      var l = $(elm.children()[1]).find("a");
      var leader = l.text().escapeSpecialChars();

      var memberCount = parseInt($(elm.children()[2]).text());
      var created = $(elm.children()[3]).text().escapeSpecialChars();

      var t = new Team(name, path, leader, memberCount, created);
      data.teams.push(t);
    }

    res.json(data);
  });

});

// /teams/korea
router.get('/:team', function(req, res) {
  var team = req.params.team;
  var base = "https://oc.tc/teams/" + team;
  var options = {
    method: 'GET',
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

  request(options, function(error, response, body) {
    var data = {};

    var $ = cheerio.load(body);

    data.id = team;
    data.name = $("h1").text();

    var pages;
    var pagination = $(".span12 .btn-group.pull-left");
    if (pagination.length) {
      var last = $(pagination).children().last();
      if ($(last).attr("href")) {
        pages = parseInt($(last).attr("href").split("?page=")[1]);
      } else {
        pages = parseInt($(last).text());
      }
    } else {
      pages = 1;
    }

    function getText(elm) {
      elm = $(elm);
      return elm.contents().filter(function() {
        return this.type === 'text';
      }).text().escapeSpecialChars();
    }


    var top = $(".span12 .span4");
    var bottom = $(".span12 .span3")

    var wools = parseInt(getText(top[0]));
    var cores = parseInt(getText(top[1]));
    var monuments = parseInt(getText(top[2]));

    var kk = parseFloat(getText(bottom[0]));
    var kd = parseFloat(getText(bottom[1]));
    var kills = parseInt(getText(bottom[2]));
    var deaths = parseInt(getText(bottom[3]));

    data.stats = {
      wools: wools,
      cores: cores,
      monuments: monuments,
      kd: kd,
      kk: kk,
      deaths: deaths
    };

    function getNextPage(page, cb) {
      options.url = base + "?page=" + page;
      request(options, function(err, response, body) {
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


      res.json(data);
    }
  });

});


module.exports = router;