'use strict'

var express = require('express');
var MessageController = require('../controllers/message');
var api = express.Router();
var md_auth = require('../midlewares/authenticate');

// api.get('/probando-md', md_auth.ensureAuth, MessageController.probando);
api.post('/message', md_auth.ensureAuth, MessageController.saveMessage);
api.get('/my-messages/:page?', md_auth.ensureAuth, MessageController.getReceiveMessages);
api.get('/messages/:page?', md_auth.ensureAuth, MessageController.getEmmitMessages);
api.get('/uniewed-messages', md_auth.ensureAuth, MessageController.getUnviewedMessages);
api.get('/set-viewed', md_auth.ensureAuth, MessageController.setViewedMessages);

module.exports = api;