"use strict";
function Player(name, previous_username, status, friends, profile, OverallStats, ObjectiveStats, ForumStats, ProjectAresStats, BlitzStats, GhostSquadronStats) {
    this.name = name;
    this.previous_username = previous_username;
    this.status = status;
    this.friends = friends;
    this.profile = profile;
    this.stats = {};
    this.stats.overall = OverallStats;
    this.stats.objectives = ObjectiveStats;
    this.stats.forum = ForumStats;
    this.stats.project_ares = ProjectAresStats;
    this.stats.blitz = BlitzStats;
    this.stats.ghost_squadron = GhostSquadronStats;
}

module.exports = Player;