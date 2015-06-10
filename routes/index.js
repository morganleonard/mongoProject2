var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var uuid = require('node-uuid');

MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
  if (err) {
    throw err;
  }
});



//===================== GET handler for home page =============================//
router.get('/', function(request, response) {
  response.render('index', {});
  // index.jade needs a form to submit a URL for shortening
});


//===================== POST handler for submitting url in form on home page ======================//
router.post('/', function(request, response) {
  var collection = db.collection('urls');
  var url = request.body.url;

  //create shortUrl and object with info like :
  /*
  {
  "_id": "atnherjgrdkgdr",
  "shortened": "bbb",
  "target": "https://google.com",
  "clicks": 8,
  "last_click": "2015-01-13T16:42:00"
}
*/
/*
  var docToInsert = {
  	"shortened" : //create shortened url,
  	"target": url,
  	"clicks": 0,
  	"last_click": //current time
  }

  collection.insert({docToInsert}, function(err, docs) {
    response.redirect('/info/' + shortUrl);
  });
});
*/
});

//===================== GET handler for info page on short URL =============================//
router.get('/info/:shortUrl', function(request, response) {
  var collection = db.collection('urls'),
      shortUrl = request.params.shortUrl;
  collection.find().toArray({'shortened': shortUrl}, function(err, url) {
    response.render('info', {url: url});
  });
});


//===================== GET handler for rerouting from short URL  =============================//
router.get('/:shortUrl', function(request, response) {
  var collection = db.collection('urls'),
      shortUrl = request.params.shortUrl;

  collection.find({'shortened': shortUrl}, function(err, url) {
  	//update clicks and last_click keys of object
    response.redirect(url.target);
  });
});


module.exports = router;
