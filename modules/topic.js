function Topic(title, author, category, posts, views) {
	this.title = title;
	this.author = author;
	this.category = category;
	this.posts = posts;
	this.views = views;
}

module.exports = Topic;