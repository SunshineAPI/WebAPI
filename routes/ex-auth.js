var express = require("express");
var router = express.Router();
var parser = require("../modules/parser");
var auth = require("../modules/auth");
var request = require("request");

router.post('/:forum', function(req, res) {
    var login = req.headers.authorization;
    var arr = login.split(":");
    if (arr.length !== 2) {
        return res.status(401).send("Provide authentication credentials in header");
    }

    var pass = arr[1];
    var username = arr[0];

    auth.get_cookie(username, pass, function(err, cookie) {
        if (cookie) {
            viewAccount(cookie);
        } else {
            auth.request_cookie(username, pass, function(err, cookie) {
                if (cookie) {
                    viewAccount(cookie);
                } else {
                    res.status(401).send("not authenticated with Overcast")
                }
            });
        }
    });

    function viewAccount(cookie) {
        var options = {
            method: 'GET',
            url: 'https://oc.tc/account',
            headers: {
                'Cookie': '_ProjectAres_sess=' + cookie
            }
        };

        request(options, function(error, response, body) {
            res.send(body);

        });
    }
});


module.exports = router;