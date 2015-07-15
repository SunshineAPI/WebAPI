var express = require('express');

var app = express();

var players = require("./routes/players");
var forums = require("./routes/forums");

app.use("/players", players);
app.use("/forums", forums);



String.prototype.escapeSpecialChars = function() {
    return this.replace(new RegExp("\\n", "g"), "", "");
};


module.exports = app;