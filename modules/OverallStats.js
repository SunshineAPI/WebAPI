"use strict";
function OverallStats(kills, deaths, kd, kk, joins, firstjoin, played, raindrops) {
	this.kills = kills;
	this.deaths = deaths;
	this.kd = kd;
	this.kk = kk;
	this.played = played;
	this.joins = joins;
	this.first_join = firstjoin;
	this.raindrops = raindrops;
}
module.exports = OverallStats;