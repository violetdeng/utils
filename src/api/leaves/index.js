'use strict';

const router = require('express').Router();
const controller = require('./leaves.controller');
const auth = require('../../auth/auth.service');

router.get('/', auth.isAuthenticated(), controller.getLeaveList());
router.post('/add', auth.isAuthenticated(), controller.add());
router.get('/destroy', auth.isAuthenticated(), controller.destroy());
router.post('/update', auth.isAuthenticated(), controller.update());
router.get('/settings', auth.isAuthenticated(), controller.getSettings());
router.post('/settings', auth.isAuthenticated(), controller.saveSettings());
router.post('/settings/upload', auth.isAuthenticated(), controller.upload());
module.exports = router;
