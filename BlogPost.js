const mongoose = require('./db');

const blogPostSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = BlogPost;
