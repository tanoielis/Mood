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
    
    app.get('/', function(req, res) {
            dbo.collection('moods').find().sort({createdAt: -1}).toArray(function (err, docs) {
                if (err) {
                        console.log(err);
                } else {
                    if (docs) {
                        let moods = [];
                        docs.forEach(function (mood) {
                            if ('createdAt' in mood === false) {
                                console.error('Depricated mood in database ' + JSON.stringify(mood));
                                return;
                            }
                            let date = mood.createdAt;
                            let start = new Date (date.getTime());
                            start.setHours(mood.start.substr(0, 2));
                            let end = new Date(start.getTime());
                            end.addHours(2);
                            moods.push('<li class="list-group-item d-flex justify-content-between align-items-center">Time: ' + start.getHours() + '-' + end.getHours() + ', ' + date.toDateString() + '<span class="badge badge-primary badge-pill">' + mood.mood + '</span></li>');
                        });
                        let page = indexStart + moods.join(' ') + indexEnd;
                        res.send(page);
                    }
                }
            });
            
        });
    
    app.post('/', function(req, res) {
            if ('moodRating' in req.body && 'startTime' in req.body) {
                let moodRating = req.body.moodRating;
                let startTime = req.body.startTime;
                let date = new Date();
                console.log(date);
                let options = {mood:moodRating,start:startTime,createdAt:date};
                dbo.collection('moods').insert(options, function (err) {
                        if(err) {
                            console.log(err);
                        }
                    });
            }
            res.redirect('/');
        });
    
    app.post('/delete', function (req, res) {
            let deletables = req.body.delete || {};
            dbo.collection('moods').remove(deletables, false);
            res.redirect('/');
        });
    
        app.listen(port, () => console.log(`Started server on port ${port}!`));
});
