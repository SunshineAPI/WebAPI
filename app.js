"use strict";
var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());
app.engine('handlebars', exphbs({
	defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
app.set("json spaces", 4);

app.use(function(req, res, next) {
	res.removeHeader("x-powered-by");
	next();
});

var index = require("./routes/index");
var players = require("./routes/players");
var forums = require("./routes/forums");
var tournaments = require("./routes/tournaments");
var teams = require("./routes/teams");
var channels = require("./routes/channels");
var stats = require("./routes/stats");
var alerts = require("./routes/alerts");
var punishments = require("./routes/punishments");
var staff = require("./routes/staff");
var maps = require("./routes/maps");
var servers = require("./routes/servers");
var friends = require("./routes/friends");

app.use('/assets', express.static('public'));

app.use("/", index);
app.use("/players", players);
app.use("/forums", forums);
app.use("/tournaments", tournaments);
app.use("/teams", teams);
app.use("/channels", channels);
app.use("/stats", stats);
app.use("/alerts", alerts);
app.use("/punishments", punishments);
app.use("/staff", staff);
app.use("/maps", maps);
app.use("/servers", servers);
app.use("/friends", friends);

app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	if (err.status === 404) {
		res.send("404 not found");
	} else {
		console.error(err);
		res.send("500 server error");
	}
});

String.prototype.escapeSpecialChars = function() {
	return this.replace(new RegExp("\\n", "g"), "", "");
};

// for some reason cheerio parses various lines with 
// spaces as new lines, rather than spaces
String.prototype.spaceSpecialChars = function() {
	return this.replace(new RegExp("\\n", "g"), " ", " ");
};


module.exports = app;