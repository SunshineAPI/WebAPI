"use strict";
function Topic(title, id, author, category, latestAuthor, latestTimestamp, posts, views) {
	this.title = title;
	this.id = id;
	this.author = author;
	this.category = category;
	this.latest = {};
	this.latest.author = latestAuthor;
	this.latest.timestamp = latestTimestamp;
	this.posts = posts;
	this.views = views;
}

module.exports = Topic;