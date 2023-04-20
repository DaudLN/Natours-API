const express = require('express');
const Post = require('../controller/Posts');

const postRouter = express.Router();

const post = new Post();

// Defining params middleware check id before other middlewares eg post, get ...
postRouter.param('id', post.checkId);
// Routing to post
postRouter
  .route('/')
  .get(post.getAllPosts)
  .post(post.checkData, post.createPost);
postRouter
  .route('/:id')
  .get(post.getPost)
  .patch(post.updatePost)
  .delete(post.deletePost);

module.exports = postRouter;
