function Player(name,status,kills,deaths,friends,kd,kk,joins,playingtime,raindrops,cores,monuments,wools,profile,ForumStats,ProjectAresStats,BlitzStats,GhostSquadronStats){
    this.name = name;
    this.status = status;
    this.kills = kills;
    this.deaths = deaths;
    this.friends = friends;
    this.kd = kd;
    this.kk = kk;
    this.joins = joins;
    this.playingtime = playingtime;
    this.raindrops = raindrops;
    this.cores = cores;
    this.monuments = monuments;
    this.wools = wools;
    this.profile = profile;
    this.ForumStats = ForumStats;
    this.ProjectAresStats = ProjectAresStats;
    this.BlitzStats = BlitzStats;
    this.GhostSquadronStats = GhostSquadronStats;
}


module.exports = Player;