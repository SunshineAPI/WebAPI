var request = require("request");
var assert = require("assert");
var server = require("../bin/www");
var helpers = require("../modules/helpers");

var username = "Jake_0";

function assertData(body, type) {
  if (type === "array") {
    assert.isArray(body.data);
  } else if (type === "hash") {
    assert.isObject(body.data);
  }
  assert.isDefined(body.links);
  assert.isObject(body.links);
}

describe("Sunshine", function() {
  describe("Server", function() {

    it("should return a valid player", function(done) {
      helpers.request("/players/" + username, function(error, res, body) {
        assert.strictEqual(res.statusCode, 200);
        var jsonBody = JSON.parse(body);
        assetData(jsonBody, "hash");
        assert.strictEqual(jsonBody.name, username);
        done();
      });
    });


    after(function(done) {
      server.server.close(function() {
        done();
      });
    });
  });

});