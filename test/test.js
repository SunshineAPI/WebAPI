"use strict";
/* globals describe: false, before: false, it: false, after: false */
var assert = require("chai").assert;
var server = require("../bin/www");
var helpers = require("../modules/helpers");
var config = require("../config");

var username = "Jake_0";
var url = "http://localhost:3000";
config.http_timeout = 5000;
config.base_url = config.test_url;

console.log("Using URL " + config.base_url + " for testing.");

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
  this.timeout(5000);
  describe("Server", function() {
    before(function(done) {
      server.boot(function() {
        done();
      });
    });

    describe("Player", function() {
      it("should return a valid player", function(done) {
        helpers.request(url + "/players/" + username, function(error, res, body) {
          assert.strictEqual(res.statusCode, 200);
          var jsonBody = JSON.parse(body);
          assertData(jsonBody, "hash");
          assert.strictEqual(jsonBody.data.username, username);
          done();
        });
      });
    });

    describe("Channels", function() {
      it("should return a list of channels", function(done) {
        helpers.request(url + "/channels", function(error, res, body) {
          assert.strictEqual(res.statusCode, 200);
          var jsonBody = JSON.parse(body);
          assertData(jsonBody, "array");
          done();
        });
      });

      it("should return an invalid page number", function(done) {
        helpers.request(url + "/channels?page=111111111111", function(error, res, body) {
          assert.strictEqual(res.statusCode, 422);
          var jsonBody = JSON.parse(body);
          assert.isArray(jsonBody.errors);
          done();
        });
      });
    });

    describe("Forums", function() {
      describe("Categories", function() {
        var testCategory;

        it("should return a list of categories", function(done) {
          helpers.request(url + "/forums/categories", function(error, res, body) {
            assert.strictEqual(res.statusCode, 200);
            var jsonBody = JSON.parse(body);
            assertData(jsonBody, "array");

            testCategory = jsonBody.data[1].sub_categories[0].id;
            var whatsNew = jsonBody.data[0];
            assert.isNull(whatsNew.sub_categories[0].id);
            done();
          });
        });

        it("should return a list of new topics", function(done) {
          helpers.request(url + "/forums/new", function(error, res, body) {
            assert.strictEqual(res.statusCode, 200);
            var jsonBody = JSON.parse(body);
            assertData(jsonBody, "array");
            done();
          });
        });

        it("should return an invalid what's new category page number", function(done) {
          helpers.request(url + "/forums/new?page=111111111111", function(error, res, body) {
            assert.strictEqual(res.statusCode, 422);
            var jsonBody = JSON.parse(body);
            assert.isArray(jsonBody.errors);
            done();
          });
        });

        it("should return a list of topics in a category", function(done) {
          helpers.request(url + "/forums/" + testCategory, function(error, res, body) {
            assert.strictEqual(res.statusCode, 200);
            var jsonBody = JSON.parse(body);

            assertData(jsonBody, "array");
            done();
          });
        });

        it("should return an invalid category page number", function(done) {
          helpers.request(url + "/forums/" + testCategory + "?page=111111111111", function(error, res, body) {
            assert.strictEqual(res.statusCode, 422);
            var jsonBody = JSON.parse(body);
            assert.isArray(jsonBody.errors);
            done();
          });
        });
      });

      describe("Topics", function() {
        it("should return a valid topic", function(done) {
          helpers.request(url + "/forums/topics/531a511512ca956f8700a54d", function(error, res, body) {
            assert.strictEqual(res.statusCode, 200);
            var jsonBody = JSON.parse(body);
            assertData(jsonBody, "hash");
            done();
          });
        });
      });
    });

    describe("Maps", function() {
      it("should return the playing maps", function(done) {
        helpers.request(url + "/maps/playing", function(error, res, body) {
          assert.strictEqual(res.statusCode, 200);
          var jsonBody = JSON.parse(body);
          assertData(jsonBody, "array");
          done();
        });
      });

      it("should return all maps", function(done) {
        helpers.request(url + "/maps/all", function(error, res, body) {
          assert.strictEqual(res.statusCode, 200);
          var jsonBody = JSON.parse(body);
          assertData(jsonBody, "array");
          done();
        });
      });

      it("should return an invalid maps page number", function(done) {
        helpers.request(url + "/maps/all?page=111111111111", function(error, res, body) {
          assert.strictEqual(res.statusCode, 422);
          var jsonBody = JSON.parse(body);
          assert.isArray(jsonBody.errors);
          done();
        });
      });

      it("should return a valid map", function(done) {
        helpers.request(url + "/maps/blockblock", function(error, res, body) {
          assert.strictEqual(res.statusCode, 200);
          var jsonBody = JSON.parse(body);
          assertData(jsonBody, "hash");
          done();
        });
      });

      describe("Gamemodes", function() {
        it("should return all maps for a gamemode", function(done) {
          helpers.request(url + "/maps/gamemode/tdm", function(error, res, body) {
            assert.strictEqual(res.statusCode, 200);
            var jsonBody = JSON.parse(body);
            assertData(jsonBody, "array");
            done();
          });
        });

        it("should return an invalid request for a bad gamemode", function(done) {
          helpers.request(url + "/maps/gamemode/invalidmode", function(error, res, body) {
            assert.strictEqual(res.statusCode, 422);
            var jsonBody = JSON.parse(body);
            assert.isUndefined(jsonBody.links);
            assert.isArray(jsonBody.errors);
            done();
          });
        });
      });
    });

    describe("Punishments", function() {
      it("should return a list of punishments", function(done) {
        helpers.request(url + "/punishments", function(error, res, body) {
          assert.strictEqual(res.statusCode, 200);
          var jsonBody = JSON.parse(body);
          assertData(jsonBody, "array");
          done();
        });
      });

      it("should return an invalid punishments page number", function(done) {
        helpers.request(url + "/punishments?page=111111111111", function(error, res, body) {
          assert.strictEqual(res.statusCode, 422);
          var jsonBody = JSON.parse(body);
          assert.isArray(jsonBody.errors);
          done();
        });
      });

      it("should return a valid punishment", function(done) {
        helpers.request(url + "/punishments/527fca2f0cf276a317ca74b0", function(error, res, body) {
          assert.strictEqual(res.statusCode, 200);
          var jsonBody = JSON.parse(body);
          assertData(jsonBody, "hash");
          done();
        });
      });

      it("should not find 'archived' punishment", function(done) {
        helpers.request(url + "/punishments/5104c5bbe4b0ab5151e10de8", function(error, res) {
          assert.strictEqual(res.statusCode, 404);
          done();
        });
      });
    });

    describe("Servers", function() {
      it("should return a list of servers", function(done) {
        helpers.request(url + "/servers", function(error, res, body) {
          assert.strictEqual(res.statusCode, 200);
          var jsonBody = JSON.parse(body);
          assertData(jsonBody, "array");
          done();
        });
      });

      it("should return a list of servers by region", function(done) {
        helpers.request(url + "/servers/us", function(error, res, body) {
          assert.strictEqual(res.statusCode, 200);
          var jsonBody = JSON.parse(body);
          assertData(jsonBody, "array");
          done();
        });
      });

      it("should return invalid region", function(done) {
        helpers.request(url + "/servers/invalidregion", function(error, res, body) {
          assert.strictEqual(res.statusCode, 422);
          var jsonBody = JSON.parse(body);
          assert.isArray(jsonBody.errors);
          done();
        });
      });

      describe("Rotations", function() {
        var rotationId;
        it("should return a list of rotations", function(done) {
          helpers.request(url + "/servers/rotations", function(error, res, body) {
            assert.strictEqual(res.statusCode, 200);
            var jsonBody = JSON.parse(body);
            assert.isDefined(jsonBody.data.us);
            assert.isDefined(jsonBody.data.eu);
            rotationId = jsonBody.data.us[0].id;
            assertData(jsonBody, "hash");
            done();
          });
        });

        it("should return a valid rotation", function(done) {
          helpers.request(url + "/servers/rotations/" + rotationId, function(error, res, body) {
            assert.strictEqual(res.statusCode, 200);
            var jsonBody = JSON.parse(body);
            assertData(jsonBody, "hash");
            done();
          });
        });
      });
    });

    describe("Staff", function() {
      it("should return a list of staff groups", function(done) {
        helpers.request(url + "/staff", function(error, res, body) {
          assert.strictEqual(res.statusCode, 200);
          var jsonBody = JSON.parse(body);
          assertData(jsonBody, "array");
          done();
        });
      });
    });

    describe("Tournaments", function() {
      it("should return a list of tournaments", function(done) {
        helpers.request(url + "/tournaments", function(error, res, body) {
          assert.strictEqual(res.statusCode, 200);
          var jsonBody = JSON.parse(body);
          assertData(jsonBody, "hash");
          done();
        });
      });

      it("should return a valid tournament", function(done) {
        helpers.request(url + "/tournaments/age-of-ares", function(error, res, body) {
          assert.strictEqual(res.statusCode, 200);
          var jsonBody = JSON.parse(body);
          assertData(jsonBody, "hash");
          done();
        });
      });

      it("should return an invalid tournament", function(done) {
        helpers.request(url + "/tournaments/invalid-tournament", function(error, res, body) {
          assert.strictEqual(res.statusCode, 404);
          var jsonBody = JSON.parse(body);
          assert.isArray(jsonBody.errors);
          done();
        });
      });
    });

    describe("Teams", function() {
      it("should return a list of teams", function(done) {
        helpers.request(url + "/teams", function(error, res, body) {
          assert.strictEqual(res.statusCode, 200);
          var jsonBody = JSON.parse(body);
          assertData(jsonBody, "array");
          done();
        });
      });

      it("should return an invalid teams page", function(done) {
        helpers.request(url + "/teams?page=12112121212", function(error, res, body) {
          assert.strictEqual(res.statusCode, 422);
          var jsonBody = JSON.parse(body);
          assert.isArray(jsonBody.errors);
          done();
        });
      });

      it("should return a valid team", function(done) {
        helpers.request(url + "/teams/sunshined", function(error, res, body) {
          assert.strictEqual(res.statusCode, 200);
          var jsonBody = JSON.parse(body);
          assertData(jsonBody, "hash");
          done();
        });
      });

      it("should return an invalid team", function(done) {
        helpers.request(url + "/teams/invalid-team", function(error, res, body) {
          assert.strictEqual(res.statusCode, 404);
          var jsonBody = JSON.parse(body);
          assert.isArray(jsonBody.errors);
          done();
        });
      });
    });

    describe("Handlebars Documentation", function() {
      it("should return the index", function(done) {
        helpers.request(url + "/", function(error, res) {
          assert.strictEqual(res.statusCode, 200);
          done();
        });
      });
    });

    after(function(done) {
      server.server.close(function() {
        done();
      });
    });
  });

});