var express = require('express');
//    router = express.Router();

var chat = require('../modules/chat');

module.exports = function(req, res) {
    var title = 'Sign up',
        index = 'signup',
        nickname = null;

    if(req.session.nickname && chat.hasUser(req.session.nickname)) {
        title = 'in games';
        index = 'in';
        nickname = req.session.nickname;
    } else {
        req.session.nickname = null;
    }

    res.render('index', {
        title : title,
        index : index,
        nickname : nickname
    });
};
