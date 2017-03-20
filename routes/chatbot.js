var express = require('express');
var router = express.Router();
var _ = require('lodash');
var watsonConversation = require('../lib/watsonConversation');
var Promise = require('bluebird');

/* GET home page. */
router.post('/conversation', function(req, res, next) {
    var input = _.get(req, 'body.input');
    var context = _.get(req, 'body.context');
    // return Promise.all([watsonConversation(input, context)])
    return watsonConversation(input, context)
        .then(function(conversation) {
            res.json({
                "status": "success",
                "data": conversation
            });
        })
        .catch(function(err) {
            res.json({
                "status": "failed",
                "message": "Something went wrong"
            });
        })
});

module.exports = router;
