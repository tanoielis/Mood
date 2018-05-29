'use strict'
const fs = require('fs');
const path = require('path');
const mongodb = require('mongodb');
const express = require('express');
const app = express();
const nconf = require('nconf');

nconf.argv()
    .env()
    .file('keys.json');

const user = nconf.get('mongoUser');
const pass = nconf.get('mongoPass');
const host = nconf.get('mongoHost');
const port = nconf.get('mongoPort');

Date.prototype.addHours=function(h){
    this.setTime(this.getTime()+(h*3600000));
    return this;
};

let uri = `mongodb://${user}:${pass}@${host}:${port}`;
if (nconf.get('mongoDatabase')) {
  uri = `${uri}/${nconf.get('mongoDatabase')}`;
}
console.log('Connecting to db: ' + uri);

mongodb.MongoClient.connect(uri, {useNewUrlParser:true}, (err, db) => {
    if (err) {
        throw err;
    };

    let indexStart, indexEnd;

    fs.readFile(path.join(__dirname, '/indexStart.html'), {encoding: 'utf-8'}, function(err, data) {
            if (err) {
                console.log(err)
            } else {
                indexStart = data;
            }
        });
    
    fs.readFile(path.join(__dirname , '/indexEnd.html'), {encoding: 'utf-8'}, function(err, data) {
            if (err) {
                console.log(err);
            } else {
                indexEnd = data;
            }
        });
    
    const port = process.env.PORT || 8080;
    
    const dbo = db.db("moodreminder"); 
    dbo.createCollection('moods');

    app.use(express.urlencoded({extended: true}));
    
   
    
        app.listen(port, () => console.log(`Started server on port ${port}!`));
});
