const User = require('../models/user')

module.exports.registerForm = (req,res)=>{
	res.render('user/register')
}

module.exports.register = async (req,res,next)=>{
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
}

module.exports.loginPage = (req,res)=>{
	res.render('user/login')
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
	console.log('REDIRECTURL:'+redirectUrl);
    res.redirect(redirectUrl);
}

module.exports.logout = (req,res)=>{
    req.logout();
    req.flash('success',"You've successfully logged out")
    res.redirect('/');
}

