const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');

const { isLoggedIn,validateCampground,isAuthor }=require('../middleware.js')

const user = require('../controllers/user');

router.route('/register')
	.get(user.registerForm)
	.post(catchAsync(user.register));

router.route('/login')
	.get(user.loginPage)
	.post( passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), user.login);

router.get('/logout',isLoggedIn,user.logout);

module.exports = router;