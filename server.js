'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var cors = require('cors');
var bodyParser = require('body-parser');
var dns = require('dns');
var MongoClient = require('mongodb').MongoClient;

var app = express();

// Basic Configuration for Heroku
var port = process.env.PORT || 3000;
var urls = [];
var mongoUrl = "mongodb+srv://joshuromi:myluv4u@cluster0-ghnhc.mongodb.net/admin?retryWrites=true&w=majority";

app.use(cors());

app.use(bodyParser.urlencoded({'extended': false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post("/api/shorturl/new",function(req,res){  
  let url = req.body.url;
  var RegExp = /^https?:\/\/(.*)/i;
  var protocol = url.match(RegExp);
    if (!protocol) {
      return res.json({"error": "invalid URL"});
    };
  
    dns.lookup(url.substring(8), function (err, addresses, family) {
      if(err){
        res.json({"error":"invalid URL"});
      }else{
  MongoClient.connect(mongoUrl, function(err, db) {
  if (err) throw err;
  var dbo = db.db("myurls");
  dbo.collection("urls").findOne({originalurl: url}, function(err, result){
    if(result){
      res.json({"original_url": result.originalurl, "short_url": result.shorturl});
    }else{
      dbo.collection("urls").find().sort({_id:-1}).toArray(function(err, result) {
    if (err) throw err;
     var newid = result[0]._id + 1;
    var shorturl = String(newid);
      
      dbo.collection("urls").insertOne({"_id": newid, "shorturl": shorturl, "originalurl": url}, function(err, result){
        if (err) throw err;
        res.json({"original_url": url, "short_url": shorturl});
        db.close();
      }); 
    });
  }})
})
}});
});

 app.get("/api/shorturl/:indexId",(req,res)=>{
    var index = req.params.indexId;
    MongoClient.connect(mongoUrl, function(err, db){
      if (err) throw err;
      var dbo = db.db("myurls");
      dbo.collection("urls").findOne({"shorturl": index}, function(err, result){
        if (err) throw err;
        console.log(result.originalurl);
        var originalurl = result.originalurl;
        res.redirect(originalurl);
        db.close();
      })
    });
 });


// Answer not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});
