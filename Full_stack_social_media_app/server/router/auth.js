const express = require('express');
const auth_router = express.Router();
const {signup, signin} = require('../controller/UserController');

auth_router.post('/signup', signup);
auth_router.post('/signin', signin);

module.exports = auth_router;