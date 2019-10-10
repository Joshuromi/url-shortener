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
    dns.lookup(url.substring(8), function (err, addresses, family) {
      if(err) res.json({"error":"invalid URL"});
      if(urls.indexOf(url)===-1){
      urls.push(url);
      }
      res.json({"original_url":url,"short_url":urls.indexOf(url)});
      
  MongoClient.connect(mongoUrl, function(err, db) {
  if (err) throw err;
  var dbo = db.db("myurls");
  var myobj = { shorturl: urls.indexOf(url), originalurl: url };
  dbo.collection("urls").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
  });
});

      });
});

 app.get("/api/shorturl/:indexId",(req,res)=>{
    let index = req.params.indexId;
    res.redirect(urls[index]);
 })


// Answer not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});
