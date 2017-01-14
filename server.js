var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient;

var path = require('path');
var stylus = require('stylus');
var request = require('request');

var html= path.join(__dirname, "views/index.html");
var styles = path.join(__dirname);


var mongourl = "mongodb://Akademskig:BibiiMami007@ds015909.mlab.com:15909/imagequerys";// || "mongodb://localhost:27017/data/db";

app.use(stylus.middleware(styles));
app.get(app.use(express.static(styles)));

app.get('/', function(req,res){
    res.sendFile(html);
})

app.get("/api/search/:query", function(req,resp){
    mongo.connect(mongourl, function(err,db){
        if(err){
            throw err;
        }
        var searchQ = db.collection("searchQ");
        var doc = {
            "query": req.params.query,
            "when": new Date()};
            
        searchQ.insert(doc,function(err,data){
                if(err){
                     throw err;
                }
               console.log(data);
            });
    });
    var opts= {
        url:"https://api.cognitive.microsoft.com/bing/v5.0/images/search?q="+ req.params.query+"&count=10",
        headers:{"Ocp-Apim-Subscription-Key":"638430516df34bdd8837d53ad0f0155d",
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
                } 
        };
    
    if(req.query.offset){
        opts.url="https://api.cognitive.microsoft.com/bing/v5.0/images/search?q="+ req.params.query+"&count=10&offset="+req.query.offset;
    }
    request.get(opts, function(err,res, body){
        if(err){
            throw err;
        }
        var imgs = JSON.parse(res.body);
        var queryResult=[];
        imgs.value.forEach(function(val){
            queryResult.push({"img": val.contentUrl, "snippet": val.hostPageDisplayUrl, "thumbnail": val.thumbnailUrl , "context":val.hostPageUrl })
        })
        resp.send(queryResult);
    });
});
        
app.get("/api/recentsearches", function(req,res){
    mongo.connect(mongourl, function(err, db){
        if(err){
            throw err;
        }
        var searchQ = db.collection("searchQ");
        searchQ.find({},{"when":1, "query":1, "_id": 0}).sort({"when": -1}).limit(10).toArray(function(err, docs){
            if(err){
                throw err;
            }
            res.send(docs);
        });
    });
});

app.listen(process.env.PORT || 8080, function(){
    console.log("Listening on port: " + process.env.PORT);
});
