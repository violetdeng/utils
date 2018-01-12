var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

// Connection URL
const url = 'mongodb://127.0.0.1:27017';

// Database Name
const dbName = 'db_tools';

// Collection Name
const collectionName = 'leaves';

/* GET leave events listing. */
router.get('/', function(req, res, next) {
  // Use connect method to connect to the server
  MongoClient.connect(url, function(err, client) {
    const db = client.db(dbName);
    db.collection(collectionName).find({}).toArray(function (err, items) {
      res.json(items);
      client.close();
    });
  });
});

const insertData = function(db, leave, callback) {  
  // 获得指定的集合 
  var collection = db.collection(collectionName);
  // 插入数据
  collection.insert(leave, function(err, result) { 
    // 如果存在错误
    if (err) {
      console.log('Error:'+ err);
      return;
    } 
    // 调用传入的回调方法，将操作结果返回
    callback(result);
  });
}

router.post('/add', function(req, res, next) {

  // Use connect method to connect to the server
  MongoClient.connect(url, function(err, client) {
    const db = client.db(dbName);
    insertData(db, req.body, function (result) {
      client.close();
      res.send(result.insertedIds[0]);
    })
  });
});

router.post('/update', function(req, res, next) {

  // Use connect method to connect to the server
  MongoClient.connect(url, function(err, client) {
    const db = client.db(dbName);
    const id = req.body.id;

    delete req.body.id;

    db.collection(collectionName).updateOne({
      _id: new ObjectID(id)
    }, {
      $set: req.body
    }, function (err, client) {
      if (err) {
        console.log('Error:'+ err);
        return;
      } 
      res.json({});
    })
  });
});

router.post('/delete', function (req, res, next) {
  MongoClient.connect(url, function(err, client) {
    const db = client.db(dbName);
    const id = req.body.id;

    db.collection(collectionName).deleteOne({
      _id: new ObjectID(id)
    }, function (err, client) {
      if (err) {
        console.log('Error:'+ err);
        return;
      } 
      res.json({});
    })
  });
});

module.exports = router;
