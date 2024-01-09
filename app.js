const path =require('path');
const fs=require('fs')

const express=require('express');
const bodyParser=require('body-parser');
const sequelize=require('./util/database');


const app=express()
const cors=require("cors")

app.use(cors())
app.use(bodyParser.json({ extended: false }));
app.use(express.static('public'));


sequelize
.sync()
.then(result=>{
    app.listen(4000);
})
.catch(err=>{
    console.log(err)
});
