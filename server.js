//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var request = require("request");

var cheerio = require("cheerio");
var express = require('express');
var app = express();
var server = http.createServer(app);
var Player = require("./Player.js");
var Profile = require("./Profile.js");
var ForumStats = require("./ForumStats.js");
var ProjectAresStats = require("./ProjectAresStats.js");
var BlitzStats = require("./BlitzStats.js");
var GhostSquadronStats = require("./GhostSquadronStats.js");
var player;
//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
app.get('/player/:player',function(req,res){
    var profile;
  scrapeFromProfile(req.params.player,function(user){
    res.send(user);
  });
  
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});


String.prototype.escapeSpecialChars = function() {
    return this.replace(new RegExp( "\\n", "g" ),"", "");
};


var modelFromData = function(user,cb){
  
    
};

var scrapeFromProfile = function(name,cb){
  request("http://oc.tc/" + name,function(error,response,body){
    var PAStats;
    var profile;
    var playerArray = new Array();
    var profileArray = new Array();
    var forumArray = new Array();
    var paArray = new Array();
    var blitzArray = new Array();
    var ghostArray = new Array();
    if(error) {console.log("Couldnt because" + error); return;
    }
    else{
      var $ = cheerio.load(body);
      if($("body > div > section:nth-child(2) > div.row > div.span3 > div").text()!=""){
       console.log("Not null");
       var toReturn = $("body > div > section:nth-child(2) > div.row > div.span3 > div").text().replace("\\n","");
       playerArray["staus"] = toReturn;
     }
     else{
       console.log("Null");
       var spanthree = $("body > div > section:nth-child(2) > div.row > div.span3 > strong");
       console.log(spanthree.text());
       playerArray["status"] =  "Seen "+spanthree.text() + " ago on " + $("body > div > section:nth-child(2) > div.row > div.span3 > span:nth-child(3) > a").text().replace("\\n","");
     }
     playerArray["kills"] = $("body > div > section:nth-child(2) > div.row > div.span7 > div > div.span8 > div > div.span5 > h2").text().escapeSpecialChars().replace("kills","");
     playerArray["deaths"] = $("body > div > section:nth-child(2) > div.row > div.span7 > div > div.span4 > h2").text().escapeSpecialChars().replace("deaths","");
     playerArray["friends"] = $("body > div > section:nth-child(2) > div.row > div.span2 > h2").text().escapeSpecialChars().replace("friends","");
     playerArray["kd"] = $("body > div > section:nth-child(2) > div.row > div.span3 > h2:nth-child(4)").text().escapeSpecialChars().replace("kd ratio","");
     playerArray["kk"] = $("body > div > section:nth-child(2) > div.row > div.span3 > h2:nth-child(5)").text().escapeSpecialChars().replace("kk ratio","");
     playerArray["joins"] = $("body > div > section:nth-child(2) > div.row > div.span3 > h2:nth-child(6)").text().escapeSpecialChars().replace("server joins","");
     playerArray["time"] = $("body > div > section:nth-child(2) > div.row > div.span3 > h2:nth-child(7)").text().escapeSpecialChars().replace("days played","");
     playerArray["raindrops"] = $("body > div > section:nth-child(2) > div.row > div.span3 > h2:nth-child(8)").text().escapeSpecialChars().replace("raindrops","");
     playerArray["bottomObj"] = $("#objectives > div:nth-child(5) > div > h2").text().escapeSpecialChars();
     playerArray["midObj"] = $("#objectives > div:nth-child(3) > div > h2").text().escapeSpecialChars();
     playerArray["topObj"] = $("#objectives > div:nth-child(1) > div > h2").text().escapeSpecialChars();
     if(String(playerArray["topObj"]).indexOf("cores") !== -1){
       playerArray["cores"] = playerArray["topObj"].replace("cores leaked","");
     }
     else if(String(playerArray["topObj"]).indexOf("monuments") !== -1){
       playerArray["monuments"] = playerArray["topObj"].replace("monuments destroyed","");
     }
     else{
       playerArray["wools"] = playerArray["topObj"].replace("wools placed","");
     }
      if(String(playerArray["midObj"]).indexOf("cores") !== -1){
       playerArray["cores"] = playerArray["midObj"].replace("cores leaked","");
     }
     else if(String(playerArray["midObj"]).toString().indexOf("monuments") !== -1){
       playerArray["monuments"] = playerArray["midObj"].replace("monuments destroyed","");
     }
     else{
       playerArray["wools"] = playerArray["topObj"].replace("wools placed","");
     }
      if(String(playerArray["bottomObj"]).indexOf("cores") !== -1){
       playerArray["cores"] = playerArray["bottomObj"].replace("cores leaked","");
     }
     else if(String(playerArray["bottomObj"]).indexOf("monuments") !== -1){
       playerArray["monuments"] = playerArray["bottomObj"].replace("monuments destroyed","");
     }
     else{
       playerArray["wools"] = playerArray["bottomObj"].replace("wools placed","");
     }
     profileArray["first"] = $("#about > div:nth-child(1) > div:nth-child(1) > blockquote > p").text().escapeSpecialChars();
     profileArray["second"] = $("#about > div:nth-child(1) > div:nth-child(2) > blockquote > p > a").text().escapeSpecialChars();
     profileArray["third"] = $("#about > div:nth-child(1) > div:nth-child(3) > blockquote > p > a").text().escapeSpecialChars();
     profileArray["fourth"] = $("#about > div:nth-child(1) > div:nth-child(4) > blockquote > p > a").text().escapeSpecialChars();
     profileArray["fifth"] = $("#about > div:nth-child(1) > div:nth-child(5) > blockquote > p > a").text().escapeSpecialChars();
     profileArray["sixth"] = $("#about > div:nth-child(1) > div:nth-child(6) > blockquote > p > a").text().escapeSpecialChars();
     
     if($("#about > div:nth-child(1) > div:nth-child(1) > h6").text().toString().indexOf("Skype")!== -1){
         profileArray["skype"] = profileArray["first"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(1) > h6").text().toString().indexOf("Twitter")!==-1){
         profileArray["twitter"] = profileArray["first"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(1) > h6").text().toString().indexOf("Facebook")!==-1){
         profileArray["facebook"] = profileArray["first"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(1) > h6").text().toString().indexOf("Steam")!==-1){
         profileArray["steam"] = profileArray["first"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(1) > h6").text().toString().indexOf("Twitch")!==-1){
         profileArray["twitch"] = profileArray["first"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(1) > h6").text().toString().indexOf("Github")!==-1){
         profileArray["github"] = profileArray["first"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(1) > h6").text().toString().indexOf("YouTube")!==-1){
         profileArray["youtube"] = profileArray["first"];
     }
     if($("#about > div:nth-child(1) > div:nth-child(2) > h6").text().toString().indexOf("Skype")!== -1){
         profileArray["skype"] = profileArray["second"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(2) > h6").text().toString().indexOf("Twitter")!==-1){
         profileArray["twitter"] = profileArray["second"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(2) > h6").text().toString().indexOf("Facebook")!==-1){
         profileArray["facebook"] = profileArray["second"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(2) > h6").text().toString().indexOf("Steam")!==-1){
         profileArray["steam"] = profileArray["second"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(2) > h6").text().toString().indexOf("Twitch")!==-1){
         profileArray["twitch"] = profileArray["second"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(2) > h6").text().toString().indexOf("Github")!==-1){
         profileArray["github"] = profileArray["second"];
     }
      else if($("#about > div:nth-child(1) > div:nth-child(2) > h6").text().toString().indexOf("YouTube")!==-1){
         profileArray["youtube"] = profileArray["second"];
     }
     if($("#about > div:nth-child(1) > div:nth-child(3) > h6").text().toString().indexOf("Skype")!== -1){
         profileArray["skype"] = profileArray["third"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(3) > h6").text().toString().indexOf("Twitter")!==-1){
         profileArray["twitter"] = profileArray["third"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(3) > h6").text().toString().indexOf("Facebook")!==-1){
         profileArray["facebook"] = profileArray["third"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(3) > h6").text().toString().indexOf("Steam")!==-1){
         profileArray["steam"] = profileArray["third"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(3) > h6").text().toString().indexOf("Twitch")!==-1){
         profileArray["twitch"] = profileArray["third"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(3) > h6").text().toString().indexOf("Github")!==-1){
         profileArray["github"] = profileArray["third"];
     }
      else if($("#about > div:nth-child(1) > div:nth-child(3) > h6").text().toString().indexOf("YouTube")!==-1){
         profileArray["youtube"] = profileArray["third"];
     }
     if($("#about > div:nth-child(1) > div:nth-child(4) > h6").text().toString().indexOf("Skype")!== -1){
         profileArray["skype"] = profileArray["fourth"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(4) > h6").text().toString().indexOf("Twitter")!==-1){
         profileArray["twitter"] = profileArray["fourth"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(4) > h6").text().toString().indexOf("Facebook")!==-1){
         profileArray["facebook"] = profileArray["fourth"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(4) > h6").text().toString().indexOf("Steam")!==-1){
         profileArray["steam"] = profileArray["fourth"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(4) > h6").text().toString().indexOf("Twitch")!==-1){
         profileArray["twitch"] = profileArray["fourth"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(4) > h6").text().toString().indexOf("Github")!==-1){
         profileArray["github"] = profileArray["fourth"];
     }
      else if($("#about > div:nth-child(1) > div:nth-child(4) > h6").text().toString().indexOf("YouTube")!==-1){
         profileArray["youtube"] = profileArray["fourth"];
     }
     if($("#about > div:nth-child(1) > div:nth-child(5) > h6").text().toString().indexOf("Skype")!== -1){
         profileArray["skype"] = profileArray["fifth"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(5) > h6").text().toString().indexOf("Twitter")!==-1){
         profileArray["twitter"] = profileArray["fifth"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(5) > h6").text().toString().indexOf("Facebook")!==-1){
         profileArray["facebook"] = profileArray["fifth"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(5) > h6").text().toString().indexOf("Steam")!==-1){
         profileArray["steam"] = profileArray["fifth"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(5) > h6").text().toString().indexOf("Twitch")!==-1){
         profileArray["twitch"] = profileArray["fifth"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(5) > h6").text().toString().indexOf("Github")!==-1){
         profileArray["github"] = profileArray["fifth"];
     }
      else if($("#about > div:nth-child(1) > div:nth-child(5) > h6").text().toString().indexOf("YouTube")!==-1){
         profileArray["youtube"] = profileArray["fifth"];
     }
     if($("#about > div:nth-child(1) > div:nth-child(6) > h6").text().toString().indexOf("Skype")!== -1){
         profileArray["skype"] = profileArray["sixth"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(6) > h6").text().toString().indexOf("Twitter")!==-1){
         profileArray["twitter"] = profileArray["sixth"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(6) > h6").text().toString().indexOf("Facebook")!==-1){
         profileArray["facebook"] = profileArray["sixth"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(6) > h6").text().toString().indexOf("Steam")!==-1){
         profileArray["steam"] = profileArray["sixth"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(6) > h6").text().toString().indexOf("Twitch")!==-1){
         profileArray["twitch"] = profileArray["sixth"];
     }
     else if($("#about > div:nth-child(1) > div:nth-child(6) > h6").text().toString().indexOf("Github")!==-1){
         profileArray["github"] = profileArray["sixth"];
     }
      else if($("#about > div:nth-child(1) > div:nth-child(6) > h6").text().toString().indexOf("YouTube")!==-1){
         profileArray["youtube"] = profileArray["sixth"];
     }
     
     
     
     profileArray["bio"] = $("#about > div:nth-child(3) > div > pre").text();
     forumArray["posts"] = $("#stats > div:nth-child(2) > div > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("forum posts","");
     forumArray["started"] = $("#stats > div:nth-child(2) > div > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("topics started","");
     paArray["kills"] = $("#stats > div:nth-child(4) > div.span4 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kills","");
     paArray["deaths"] = $("#stats > div:nth-child(4) > div.span4 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("deaths","");
     paArray["kd"] = $("#stats > div:nth-child(4) > div.span3 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kd","");
     paArray["kk"] = $("#stats > div:nth-child(4) > div.span3 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("kk","");
     paArray["played"] = $("#stats > div:nth-child(4) > div.span5 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("days played","");
     paArray["observed"] = $("#stats > div:nth-child(4) > div.span5 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("days observed","");
     blitzArray["kills"] = $("#stats > div:nth-child(6) > div.span4 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kills","");
     blitzArray["deaths"] = $("#stats > div:nth-child(6) > div.span4 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("deaths","");
     blitzArray["kd"] = $("#stats > div:nth-child(6) > div.span3 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kd","");
     blitzArray["kk"] = $("#stats > div:nth-child(6) > div.span3 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("kk","");
     blitzArray["played"] = $("#stats > div:nth-child(6) > div.span5 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("days played","");
     blitzArray["observed"] = $("#stats > div:nth-child(6) > div.span5 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("days observed","");
     ghostArray["kills"] = $("#stats > div:nth-child(8) > div.span4 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kills","");
     ghostArray["deaths"] = $("#stats > div:nth-child(8) > div.span4 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("deaths","");
     ghostArray["kd"] = $("#stats > div:nth-child(8) > div.span3 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("kd","");
     ghostArray["kk"] = $("#stats > div:nth-child(8) > div.span3 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("kk","");
     ghostArray["played"] = $("#stats > div:nth-child(8) > div.span5 > div > div:nth-child(1) > h3").text().escapeSpecialChars().replace("days played","");
     ghostArray["observed"] = $("#stats > div:nth-child(8) > div.span5 > div > div:nth-child(2) > h3").text().escapeSpecialChars().replace("days observed","");
     PAStats = new ProjectAresStats(paArray["kills"],paArray["deaths"],paArray["kd"],paArray["kk"],paArray["played"],paArray["observed"]);
     var Blitz = new BlitzStats(blitzArray["kills"],blitzArray["deaths"],blitzArray["kd"],blitzArray["kk"],blitzArray["played"],blitzArray["observed"]);
     var ghost = new GhostSquadronStats(ghostArray["kills"],ghostArray["deaths"],ghostArray["kd"],ghostArray["kk"],ghostArray["played"],ghostArray["observed"]);
     var forums = new ForumStats(forumArray["posts"],forumArray["started"]);
    profile = new Profile(profileArray["skype"],profileArray["twitter"],profileArray["facebook"],profileArray["steam"],profileArray["twitch"],profileArray["github"],profileArray["Youtube"],profileArray["bio"]);
      player = new Player(name,playerArray["status"],playerArray["kills"],playerArray["deaths"],playerArray["friends"],playerArray["kd"],playerArray["kk"],playerArray["joins"],playerArray["time"],playerArray["raindrops"],playerArray["cores"],playerArray["monuments"],playerArray["wools"],profile,forums,PAStats,Blitz,ghost);
    console.log(player);
    cb(player);
    
      
    }
    
  });
};