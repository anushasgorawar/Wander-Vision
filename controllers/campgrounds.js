const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken })
const { cloudinary } = require("../cloudinary");

module.exports.index = async(req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}
module.exports.renderNewForm = (req,res)=>{
	res.render('campgrounds/addnew')
}
module.exports.createNewCampground = async(req,res,next)=>{
    const geodata = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit:1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.geometry = geodata.body.features[0].geometry;
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success','Successfully added a new campground');
    res.redirect(`/campgrounds/${campground._id}`,{campground});
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
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
     if(!campground){
        req.flash('error','Cannot edit your Campground');
        return res.redirect('/campgrounds')
    }
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({$pull:{ images:{ filename:{ $in: req.body.deleteImages } } }})
    }
    req.flash('success','Updated your Campground');
    res.redirect(`/campgrounds/${campground._id}`);
}
module.exports.delete = async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    for(let filename of campground.images){
        await cloudinary.uploader.destroy(filename.filename)
    }

    await Campground.findByIdAndDelete(id);
    req.flash('success','Your campground is deleted');
    res.redirect('/campgrounds');
}