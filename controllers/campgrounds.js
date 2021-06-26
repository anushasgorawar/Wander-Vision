const Campground = require('../models/campground');

module.exports.index = async(req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}
module.exports.renderNewForm = (req,res)=>{
	res.render('campgrounds/addnew')
}
module.exports.createNewCampground = async(req,res,next)=>{
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success','Successfully added a new campground');
    res.redirect('/campgrounds');
}
module.exports.show = async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    console.log(campground)
    res.render('campgrounds/show', { campground });
}
module.exports.updateForm = async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error',"Sorry, That campground doesn't exist");
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{campground});
}
module.exports.update = async(req,res)=>{
	const {id} = req.params;
  const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground}); 
  req.flash('success','Updated your Campground');
  res.redirect(`/campgrounds/${id}`);
}
module.exports.delete = async (req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Your campground is deleted');
    res.redirect('/campgrounds');
}