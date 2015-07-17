var express = require('express');

var app = express();

var players = require("./routes/players");
var forums = require("./routes/forums");
var tournaments = require("./routes/tournaments");
var teams = require("./routes/teams");
var channels = require("./routes/channels");
var stats = require("./routes/stats");


app.use("/players", players);
app.use("/forums", forums);
app.use("/tournaments", tournaments);
app.use("/teams", teams);
app.use("/channels", channels);
app.use("/stats", stats);




String.prototype.escapeSpecialChars = function() {
    return this.replace(new RegExp("\\n", "g"), "", "");
};


module.exports = app;