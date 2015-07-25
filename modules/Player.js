"use strict";
function Player(name, status, friends, cores, monuments, wools, profile, OverallStats, ForumStats, ProjectAresStats, BlitzStats, GhostSquadronStats) {
    this.name = name;
    this.status = status;
    this.friends = friends;
    this.cores = cores;
    this.monuments = monuments;
    this.wools = wools;
    this.profile = profile;
    this.stats = {};
    this.stats.overall = OverallStats;
    this.stats.forum = ForumStats;
    this.stats.project_ares = ProjectAresStats;
    this.stats.blitz = BlitzStats;
    this.stats.ghost_squadron = GhostSquadronStats;
}

module.exports = Player;