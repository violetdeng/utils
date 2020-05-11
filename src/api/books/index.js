'use strict';

const router = require('express').Router();
const controller = require('./books.controller');
const auth = require('../../auth/auth.service');

router.get('/', auth.isAuthenticated(), controller.all());
router.post('/add', auth.isAuthenticated(), controller.add());
router.get('/destroy', auth.isAuthenticated(), controller.destroy());
router.post('/upload', auth.isAuthenticated(), controller.upload());
router.post('/update', auth.isAuthenticated(), controller.update());
router.post('/replace', auth.isAuthenticated(), controller.replace());
router.get('/download', auth.isAuthenticated(), controller.download());
router.get('/change', controller.updateDownloadStatus());
module.exports = router;
