var express = require('express');

var app = express();

var players = require("./routes/players");

app.use("/players", players);



String.prototype.escapeSpecialChars = function() {
    return this.replace(new RegExp("\\n", "g"), "", "");
};


module.exports = app;