var express = require("express");
var router = express.Router();
var parser = require("../modules/parser");
var request = require("request");
var cheerio = require("cheerio");

router.get('/', function(req, res) {
    var options = {
        method: 'GET',
        url: 'https://oc.tc/staff'
    }

    request(options, function(error, response, body) {
        if (error) {
            return res.status(error.status).send(error.message);
        }
        var $ = cheerio.load(body);

        // move to parser
        function getText(elm) {
            elm = $(elm);
            return elm.contents().filter(function() {
                return this.type === 'text';
            }).text().escapeSpecialChars();
        }

        var groups = $(".staff-group");
        var data = {};
        var staff = [];

        for (var i = 0; i < groups.length; i++) {
            var group = $(groups[i]);
            var header = group.find("h2");
            var title = getText(header).escapeSpecialChars();
            var color = header.css("color");
            var members = [];
            
            var thumbs = group.find(".thumbnail div.staff-caption");
            thumbs.each(function(i, elm) {
                elm = $(elm);
                members.push(elm.text().escapeSpecialChars());
            });

            staff.push({
                title: title,
                color: color,
                members: members
            });
        }

        data.groups = staff;

        res.json(data);
    });
});

module.exports = router;