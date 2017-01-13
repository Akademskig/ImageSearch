var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SearchQ= new Schema({
    query: String,
    when: Date
})

var ImageQuery = mongoose.model('ImageQuery', SearchQ);



module.exports= ImageQuery;