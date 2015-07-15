var express = require('express');

var app = express();

var players = require("./routes/players");
var forums = require("./routes/forums");
var tournaments = require("./routes/tournaments");


app.use("/players", players);
app.use("/forums", forums);
app.use("/tournaments", tournaments);




String.prototype.escapeSpecialChars = function() {
    return this.replace(new RegExp("\\n", "g"), "", "");
};


module.exports = app;