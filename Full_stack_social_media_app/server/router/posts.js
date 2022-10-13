const express = require('express');
const {createPost, getAllPosts, getMyPosts,likePost, unlikePost,addComment,deletePost,getFollowingUserPosts} = require('../controller/PostController');
const requireLoggingin = require('../middleware/requireLoggingin');
const posts_router = express.Router();

posts_router.get('/',requireLoggingin, getAllPosts);
posts_router.get('/myposts',requireLoggingin, getMyPosts);
posts_router.post('/createpost',requireLoggingin,createPost);
posts_router.post('/like',requireLoggingin,likePost);
posts_router.delete('/unlike',requireLoggingin,unlikePost);
posts_router.post('/addcomment',requireLoggingin,addComment);
posts_router.delete('/deletepost/:post_id',requireLoggingin,deletePost);
posts_router.get('/followingUserPosts',requireLoggingin, getFollowingUserPosts);
module.exports = posts_router;
