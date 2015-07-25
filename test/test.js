var request = require("request");
var assert = require("assert");
var server = require("../bin/www");

var username = "Jake_0";

describe("Sunshine", function() {
  describe("Server", function() {

    before(function(done) {
      server.boot(function() {
        done();
      });
    });

    var tests = [{
      description: "player data from username",
      path: "/players/" + username,
      status: 200,
      typeOf: "hash"
    }, {
      description: "list of player channels",
      path: "/channels",
      status: 200,
      typeOf: "array"

    }, {
      description: "new forum category",
      path: "/forums/new",
      status: 200,
      typeOf: "array"

    }, {
      description: "forum categories",
      path: "/forums/categories",
      status: 200,
      typeOf: "array"

    }, {
      description: "forum categories",
      path: "/forums/categories",
      status: 200,
      typeOf: "array"

    }]

    for (var t in tests) {
      var hash = tests[t];
      (function(test) {
        it("should return the correct data for " + test.description, function(done) {
          request.get("http://localhost:3000" + test.path, function(error, res, body) {
            if (test.status) {
              assert.strictEqual(res.statusCode, 200);
            }
            var jsonBody = JSON.parse(body);
            if (test.typeOf) {
              if (test.typeOf === "array") {
                assert.isArray(jsonBody.data);
              } else if (test.typeOf === "hash") {
                assert.isObject(jsonBody.data);
              }
            }
            assert.isDefined(jsonBody.links);
            assert.isObject(jsonBody.links);
            done();
          });
        });

      })(hash);

    }

    after(function(done) {
      server.server.close(function() {
        done();
      });
    });
  });

});