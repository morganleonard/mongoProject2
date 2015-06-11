var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var uuid = require('node-uuid');
// var app = require('../app');

//===================== GET handler for home page =============================//
router.get('/', function(request, response) {
  response.render('index', {});
});

//===================== POST handler for submitting url in form on home page ======================//
router.post('/url', function(request, response) {
  var random = uuid.v4();
  var url = request.body.url;
  // var database = app.get('database');
  MongoClient.connect('mongodb://127.0.0.1:27017/url_shortener', function(err, db) {
    if (err) {
       throw err;
    }
    var collection = db.collection('url_shortener');
    collection.insert(
      {
        "shortened": random,
        "target": url,
        "clicks": 0
      }, function(err, docs) {
      collection.count(function(err, count) {
        console.log("count = %s", count);
      });
      collection.update({'target': url}, { $inc: {"clicks": 1}
      });
      collection.update({'target': url}, { $currentDate: {"last_click": {$type: "timestamp"}}
      });
      collection.find().toArray(function(err, results) {
        console.dir(results);
        db.close();
      });
    });
  });
  console.log(random);
  console.log(url); 
  response.redirect("/info/" + random);
});

//===================== GET handler for info page on short URL =============================//
router.get('/info/:shortUrl', function(request, response) {
  MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db){
    if(err){
      throw err;
    }
    var collection = db.collection('url_shortener'),
        shortUrl = request.params.shortUrl;
    // var target = db.collection.find({target: {}});
    console.log("target");
    // collection.find().toArray({'shortened': shortUrl}, function(err, url) {
    // response.render('info', {url: url});
    // });
  });
});


//===================== GET handler for rerouting from short URL  =============================//
router.get('/:shortUrl', function(request, response) {
  var database = app.get('database');
  var collection = db.collection('urls'),
      shortUrl = request.params.shortUrl;

  collection.find({'shortened': shortUrl}, function(err, url) {
    //update clicks and last_click keys of object
    response.redirect(url.target);
  });
});


module.exports = router;



