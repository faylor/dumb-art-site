
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var User = mongoose.model('User');

exports.login = function (req, res) {
    var username = '';
    var password = '';
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        username = fields.username
        password = fields.password;
    });

    if (username == '' || password == '') {
        return res.send(401);
    }

    User.findOne({username: username}, function (err, user) {
        if (err) {
            console.log(err);
            return res.send(401);
        }

        user.comparePassword(password, function(isMatch) {
            if (!isMatch) {
                console.log("Attempt failed to login with " + user.username);
                return res.send(401);
            }

            var token = jwt.sign(user, secret.secretToken, { expiresInMinutes: 60 });

            return res.json({token:token});
        });

    });
};
