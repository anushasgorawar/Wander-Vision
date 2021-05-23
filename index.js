const express = require('express');
const app = express();
const path = require('path');
const mongoose= require('mongoose');
const Campground = require('./models/campground')

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



const methodOverride= require("method-override");
app.use(methodOverride('_method'))

app.set('view engine','ejs');
app.set('views',path.join(__dirname,"views"))

app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());


app.get('/',(req,res)=>{
    res.render('home');
})
app.get('/newcampground',async(req,res)=>{
    const camp = new Campground({title: 'My ground',description:"Cheap camping"});
    // await camp.save();
    res.send(camp);
})

app.listen(3000,()=>{
    console.log('listening on port 3000');
})