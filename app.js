var express = require('express');

var app = express();

var players = require("./routes/players");
var forums = require("./routes/forums");
var tournaments = require("./routes/tournaments");
var teams = require("./routes/teams");

app.use("/players", players);
app.use("/forums", forums);
app.use("/tournaments", tournaments);
app.use("/teams", teams);




String.prototype.escapeSpecialChars = function() {
    return this.replace(new RegExp("\\n", "g"), "", "");
};


module.exports = app;