"use strict";
function Team(name, id, leader, memberCount, members, tourneyId, tourneyStatus, tourneyRegistered) {
	this.name = name;
	this.id = id;
	this.leader = leader;
	this.member_count = memberCount;
	if (Array.isArray(members)) {
		this.members = members;
	} else {
		this.created = members;
	}
	var tourney = {};
	tourney.id = tourneyId;
	tourney.status = tourneyStatus;
	tourney.registered = tourneyRegistered;

	if (!(tourneyId && tourneyStatus && tourneyRegistered)) return;
	this.tourney = tourney;
}

module.exports = Team;