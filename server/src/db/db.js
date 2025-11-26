const mongoose = require('mongoose');

function connectToDb(){
    mongoose.connect(process.env.dbUrl)
        .then(()=>{
            console.log('Connected to database');
        })
        .catch((err)=>{
            console.log('Error connecting to database', err);
        });
}

module.exports = connectToDb;