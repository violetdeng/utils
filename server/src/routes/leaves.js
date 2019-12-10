const router = require('express').Router();
const config = require('config');
const email = require('emailjs');

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

// Connection URL
const url = 'mongodb://127.0.0.1:27017';

// Database Name
const dbName = 'db_tools';

// Collection Name
const collectionName = 'leaves';

const sendMail = function (leaveType, time, cb) {

  const server = email.server.connect({
    user: config.get('mail.username'),
    password: config.get('mail.password'),
    host: 'smtp.qq.com',
    ssl: true
  });

  server.send({
    from: config.get('mail.username'),
    //to: 'violet@taomee.com',
    to: config.get('mail.username'),
    subject: '请假',
    text: '',
    attachment: [
    {
      data: "<html>Dear eric<br /><br />"
        + '<table border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">'
        + '<tr>'
        + '<td style="border: 1pt solid windowtext; padding: 0cm 5.4pt;">violet</td>'
        + '<td style="border: 1pt solid windowtext; padding: 0cm 5.4pt;">员工工号</td>'
        + '<td style="border: 1pt solid windowtext; padding: 0cm 5.4pt;">493</td>'
        + '<td style="border: 1pt solid windowtext; padding: 0cm 5.4pt;">部门</td>'
        + '<td style="border: 1pt solid windowtext; padding: 0cm 5.4pt;">B01运营开发部</td>'
        + '</tr>'
        + '<tr>'
        + '<td style="border: 1pt solid windowtext; padding: 0cm 5.4pt;">请假类别</td>'
        + '<td style="border: 1pt solid windowtext; padding: 0cm 5.4pt;" colspan="5">'
        + config.get('leaves.types').map(function (type) {
          return (type.key === leaveType ? '■' : '□') + type.title;
        }).join('&nbsp;')
        + '</td></tr>'
        + '<tr>'
        + '<td style="border: 1pt solid windowtext; padding: 0cm 5.4pt;">预计休假时间</td>'
        + '<td style="border: 1pt solid windowtext; padding: 0cm 5.4pt;" colspan="5">' + time + '</td>'
        + '</tr>'
        + '<table>'
        + "<br /><br /></html>",
      alternative:true
    },
    {
      path: "assets/signature.png",
      type: "image/png",
      headers: {
        "Content-ID": "<my-image>"
      },
      name: 'signature.png'
    }
    ]
  }, function (err, message) {
    console.log(err || message);
    cb();
  });
}

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

router.post('/mail', function (req, res, next) {
  MongoClient.connect(url, function(err, client) {
    const db = client.db(dbName);
    const id = req.body.id;

    db.collection(collectionName).findOne({
      _id: new ObjectID(id)
    }, function (err, item) {
      if (err) {
        console.log('Error:'+ err);
        return;
      } 

      sendMail(item.type, item.start + '至' + item.end, function () {
        res.json({});
      });

    })
  });
});

module.exports = router;
