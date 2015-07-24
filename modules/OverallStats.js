"use strict";
function OverallStats(kills, deaths, kd, kk, joins, played, raindrops) {
	this.kills = kills;
	this.deaths = deaths;
	this.kd = kd;
	this.kk = kk;
	this.played = played;
	this.joins = joins;
	this.raindrops = raindrops;
}
module.exports = OverallStats;