// const express = require('express');
// const path = require('path');

//IF EXCECUTED, ALL DATA WILL BE DELETED AND REPOPULATED

const mongoose= require('mongoose');
const Campground = require('../models/campground');
const cities=require('./cities');
const {places, descripters} = require('./seedHelpers');

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

const array_random = (array) =>
    array[Math.floor(Math.random()*array.length)];

const seedDB = async()=>{
    await Campground.deleteMany({});
    for (let i=0;i<50;i++){
        const random = Math.floor(Math.random()*187);
        const pr = Math.floor(Math.random()*15)*100+99;
        const c = new Campground ({
            title: `${array_random(descripters)} ${array_random(places)}`,
            location: `${cities[random].city},${cities[random].admin_name}`,
            price: pr,
            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Enim quo doloribus consequuntur unde natus. Consectetur, enim illum. Veritatis, assumenda ex!",
            image: "https://source.unsplash.com/featured/?india,nature"

        })
        await c.save();
    }
}
seedDB().then(()=>{
    db.close();
})