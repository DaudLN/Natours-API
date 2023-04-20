const fs = require('fs');
const status = require('statuses');
const posts = require('../models/tourModel');

class Post {
  // Check id middleware

  checkId = (req, res, next, val) => {
    console.log(`The post id entered is ${val}`);
    if (val * 1 > posts.length) {
      return res.status(status('not found')).json({
        message: 'Invalid id',
      });
    }
    next();
  };

  checkData = (req, res, next) => {
    if (!req.body.title || !req.body.author || !req.body.category_name) {
      return res.status(status('Bad Request')).json({
        Status: 'Failed',
        Reason: 'Missing title or author or category',
      });
    }
    next();
  };

  // Get posts

  getAllPosts = (req, res) => {
    res.status(status('ok')).json({
      status: 'Success',
      requestTime: req.requestTime,
      result: posts.length,
      posts,
    });
  };

  // Get single post

  getPost = (req, res) => {
    const postId = req.params.id * 1;
    const post = posts.find((el) => el.id === postId);
    res.status(status('ok')).json(post);
  };

  // Post endpoint
  createPost = (req, res) => {
    const newId = posts[posts.length - 1].id + 1;
    const newPost = {
      id: newId,
      created_at: req.requestTime,
      ...req.body,
    };
    posts.push(newPost);

    fs.writeFile(
      `${__dirname}/../data/posts.json`,
      JSON.stringify(posts),
      (err) => {
        console.log(err);
        res.status(status('created')).json({
          status: 'Post created',
          post: newPost,
        });
      }
    );
  };

  // Update post

  updatePost = (req, res) => {
    const id = req.params.id * 1;
    const updates = req.body;
    const post = posts.find((el) => el.id === id);
    res.status(status('ok')).json(post);
    console.log(updates);
  };

  // Delete post
  deletePost = (req, res) => {
    const id = req.params.id * 1;
    posts.find((el) => el.id === id);
    res.status(status('no content')).json({
      Message: 'Sucess',
      data: null,
    });
  };
}

module.exports = Post;
