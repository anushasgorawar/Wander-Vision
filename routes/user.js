const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport')
const catchAsync = require('../utils/catchAsync')

router.get('/register',(req,res)=>{

	res.render('user/register')
})
router.post('/register',catchAsync(async (req,res,next)=>{
	try{
		const {username,email,password} = req.body;
		const newUser = new User({email, username});
		const registeredUser = await User.register(newUser,password);
		req.login(registeredUser,er=>{
			if(er) return next(er);
			req.flash('success','Welcome to yelpCamp!')
			res.redirect('/campgrounds');
		})
	}
	catch(e){
		req.flash('error',e.message);
		res.redirect('/register')
	} 
}))
router.get('/login',(req,res)=>{
	res.render('user/login')
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success',"You've successfully logged out")
    res.redirect('/');
})

module.exports = router;