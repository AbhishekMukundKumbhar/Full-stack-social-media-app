const express = require('express');
const user_router = express.Router();
const {getUserAndPosts, follow, unfollow,getProfileFollowDetails,updateProfilePic,searchUser} = require('../controller/UserController');
const requireLoggingin = require('../middleware/requireLoggingin');

user_router.get('/userprofile/:email', requireLoggingin,getUserAndPosts);
user_router.post('/follow', requireLoggingin,follow);
user_router.post('/unfollow', requireLoggingin,unfollow);
user_router.get('/profilefollowdetails', requireLoggingin,getProfileFollowDetails);
user_router.put('/updateProfilePic', requireLoggingin,updateProfilePic);
user_router.post('/search-user', requireLoggingin,searchUser);

module.exports = user_router;