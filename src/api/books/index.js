'use strict';

const router = require('express').Router();
const controller = require('./books.controller');
const auth = require('../../auth/auth.service');

router.get('/', auth.isAuthenticated(), controller.all());
router.post('/add', auth.isAuthenticated(), controller.add());
router.get('/destroy', auth.isAuthenticated(), controller.destroy());
router.post('/upload', auth.isAuthenticated(), controller.upload());
module.exports = router;
