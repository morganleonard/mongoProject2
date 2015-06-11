var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var uuid = require('node-uuid');

//===================== GET handler for home page =============================//
router.get('/', function(request, response) {
  console.log('working');
  MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
    if (err) {
      throw err;
    }
    var collection = db.collection('url_shortener');
    console.log('inside mongo');
  });
  response.render('index', {});
});

//===================== POST handler for submitting url in form on home page ======================//
router.post('/url', function(request, response) {
  var random = uuid.v4();
  var url = request.body.url;
  MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
    if (err) {
      throw err;
    }
    var collection = db.collection('url_shortener');
    collection.find({"target": url}).toArray(function(err, results) {
      console.log(results[0]);
      if(results[0]){
        collection.update({'target': url}, { $inc: {"clicks": 1}, 
          $set: { "last_click": new Date()}
        });
        response.redirect("/info/" + results[0].shortened);
      } else {
        collection.insert(
          {
            "shortened": random,
            "target": url,
            "clicks": 0,
            "last_click" : new Date()
          }, function(err, docs) {
              response.redirect("/info/" + random);
              collection.count(function(err, count) {
                console.log("count = %s", count);
          });
          collection.find().toArray(function(err, results) {
            console.dir(results);
            db.close();
          });
        });
      }
    });
  });
});

//===================== GET handler for info page on short URL =============================//
router.get('/info/:shortUrl', function(request, response) {
  MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
    if (err) {
      throw err;
    }
    var collection = db.collection('url_shortener'),
        shortUrl = request.params.shortUrl;
    collection.find({shortened : shortUrl}).toArray(function(err, results) {
      console.log(results[0])
      response.render('info', {url : results[0]});
      })
  });
});


//===================== GET handler for rerouting from short URL  =============================//
router.get('/redirect/:shortUrl', function(request, response) {
  MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
    if (err) {
      throw err;
    }
    var collection = db.collection('url_shortener'),
        shortUrl   = request.params.shortUrl;
    collection.find({shortened : shortUrl}).toArray(function(err, results) {
      response.redirect(results[0].target);
      })
  });
});


module.exports = router;