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
            author: "60d40828a6091343f559ad6b",
            title: `${array_random(descripters)} ${array_random(places)}`,
            location: `${cities[random].city},${cities[random].admin_name}`,
            price: pr,
            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Enim quo doloribus consequuntur unde natus. Consectetur, enim illum. Veritatis, assumenda ex!",
            images: [
                {
                  url: 'https://res.cloudinary.com/esjiwanders/image/upload/v1624817793/Wander/gfe9yhxy85mbn2tqamdx.jpg',
                  filename: 'Wander/gfe9yhxy85mbn2tqamdx'
                },
                {
                  url: 'https://res.cloudinary.com/esjiwanders/image/upload/v1624817792/Wander/qzye4msad35tjbcrgkjj.jpg',
                  filename: 'Wander/qzye4msad35tjbcrgkjj'
                }
              ]
        })
        await c.save();
    }
}
seedDB().then(()=>{
    db.close();
})