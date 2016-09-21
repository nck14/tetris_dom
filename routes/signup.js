var express = require('express'),
    router = express.Router();

var chat = require('../modules/chat');

module.exports = function(req, res){
    var nickname = req.param('nickname');
    try {
        if(!nickname) {
            throw 'nickname is required';
        } else {
            if(chat.hasUser(nickname)) throw 'nickname is already in use';

            req.session.nickname = nickname;
            chat.addUser(nickname);
        }
    } catch(e) {
        req.session.nickname = null;
        res.send('<script type="text/javascript">alert("'+e+'");</script>');
    }

    res.redirect('/');
};
