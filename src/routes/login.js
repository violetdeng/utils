const express = require('express')
const axios = require('axios')
const router = express.Router()
const MongoClient = require('mongodb').MongoClient;

const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const secretStr = 'sdfsjfklsjfiewjwoieow'
const cert = fs.readFileSync(path.resolve(__dirname, '../config/jwt.pem'));

// 根据mongodb生成的_id查询数据
const url = 'mongodb://127.0.0.1:27017';

// Database Name
const dbName = 'db_tools';

// Collection Name
const collectionName = 'leaves';

const clientID = '42d527c17b032d63fc1d';
const clientSecret = '054d0dbf4738556d74224b08383ca970242fbf91';

router.get('/login',function(req,res){
  const authorize_uri = 'https://github.com/login/oauth/authorize';
  const redirect_uri = 'http://violetdeng.com:3000/login/oauth/redirect';
  res.redirect(`${authorize_uri}?client_id=${clientID}&redirect_uri=${redirect_uri}`);
});
router.get('/login/oauth/redirect', function (req, res) {
  if (req.query.code) {
    const requestToken = req.query.code;
    axios({
      method: 'post',
      url: 'https://github.com/login/oauth/access_token?' +
        `client_id=${clientID}&` +
        `client_secret=${clientSecret}&` +
        `code=${requestToken}`,
      headers: {
        accept: 'application/json'
      }
    }).then(tokenResponse => {
      if (tokenResponse.data.access_token) {
        const accessToken = tokenResponse.data.access_token;
        axios({
          method: 'get',
          url: `https://api.github.com/user`,
          headers: {
            accept: 'application/json',
            Authorization: `token ${accessToken}`
          }
        }).then(result => {
          if (result.data.id) {
            //成功获取用户对象
            MongoClient.connect(url, function(err, db) {
              if (err) throw err;
              var dbo = db.db(dbName);
              let token = jwt.sign({
                _id: result.data.id,
                name: result.data.name
              }, cert, {
                algorithm: 'RS256',
                expiresIn: '1h'
              });
              dbo.collection(collectionName).save({ _id: result.data.id, name: result.data.name, token: token });
              db.close();

              res.redirect('http://localhost:8081?token=' + token);
            });
            //req.session.regenerate(function(){
              //req.user = result.data;
              //req.session.userId = result.data.id;
              //req.session.save();  //保存一下修改后的Session
            //});  
          } else {
            res.send('登录出错');
          }
        }).catch(e => {
          res.redirect('/login');
        });
      } else {
        res.redirect('/login');
      }
    }).catch(e=> {
      res.redirect('/login');
    });
  } else {
    res.redirect('/login');
  }
});

// 登出
router.get('/logout', function (req, res) {
  //req.clearCookie('connect.sid');
  //req.user = null;

  //req.session.regenerate(function(){
    //重新生成session之后后续的处理
    res.redirect('/login');
  //})
});

// 验证jsonwebtoken是否过期的中间件，在login接口后面执行，除了login接口的请求外，其他接口都需要验证token
router.use(function jwtVerify(req, res, next) {
  let token = req.get('token')
  // 先解密
  jwt.verify(token, cert, function(err,decoded){
    if(err || !decoded) {
      res.send({
        result: -1
      })
    }

    dbo.collection(collectionName).findOne({ _id: decoded._id }).then(item => {
      if (item) {
        if (item.token === token) {
          next();
        }
      }
      res.send({
        result: -1
      })
    });
  });
});

module.exports = router
