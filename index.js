const express = require('express');
const path = require('path');
const mongoose= require('mongoose');
const Campground = require('./models/campground');
mongoose.connect('mongodb://localhost:27017/camp',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
});
const db=mongoose.connection;
db.on('error',console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database Connected");
})


const app = express();

const methodOverride = require('method-override');
app.use(methodOverride('_method'))

app.set('view engine','ejs');
app.set('views',path.join(__dirname,"/views"));

app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());


app.get('/',(req,res)=>{
    res.render('home');
})
app.get('/campgrounds',async(req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
})
// CREATE
app.get('/campgrounds/addnew',(req,res)=>{
    res.render('campgrounds/addnew')
})
app.post('/campgrounds',async(req,res)=>{
    const campground = new Campground(req.body);
    await campground.save();
    res.redirect('/campgrounds');
})
//READ
app.get('/campgrounds/:id',async(req,res)=>{
    const {id}= req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show',{campground});
})

//UPDATE
app.get('/campgrounds/:id/edit',async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit',{campground});
})
app.put('/campgrounds/:id',async(req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndUpdate(id,req.body,{runValidators:true,new:true});
    res.redirect(`/campgrounds/${id}`);
})

//DELETE
app.delete('/campground/:id',async(req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})


app.get('*',(req,res)=>{
    res.send("Wrong place to be..");
})

app.listen(3000,()=>{
    console.log('listening on port 3000');
})
