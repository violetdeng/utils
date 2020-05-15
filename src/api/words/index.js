'use strict';

const router = require('express').Router();
const controller = require('./words.controller');
const auth = require('../../auth/auth.service');

router.get('/', auth.isAuthenticated(), controller.all());
router.post('/add', auth.isAuthenticated(), controller.add());
router.get('/destroy', auth.isAuthenticated(), controller.destroy());
router.post('/update', auth.isAuthenticated(), controller.update());
router.get('/exec', auth.isAuthenticated(), controller.doExecute());
router.get('/replace', auth.isAuthenticated(), controller.replace());

router.get('/examine', controller.show());

router.get('/api/change', controller.updateStatus());

module.exports = router;
