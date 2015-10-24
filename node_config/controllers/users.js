
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var User = mongoose.model('User');
var formidable  = require('formidable');

exports.login = function (req, res) {
    var username = '';
    var password = '';
    var form = new formidable.IncomingForm();
    var fieldValues={};
    form.on('field', function(field, value) {
      console.log("THIS IS WHAT IS FOUND:::>>"+field, value);
      fieldValues[field]=value;
    })

    if (username == '' || password == '') {
        console.log("empty username and password" + fieldValues.username);
        return res.send(401);
    }

    User.findOne({username: fieldValues.username}, function (err, user) {
        if (err) {
            console.log(err);
            return res.send(401);
        }

        user.comparePassword(fieldValues.password, function(isMatch) {
            if (!isMatch) {
                console.log("Attempt failed to login with " + user.username);
                return res.send(401);
            }

            var token = jwt.sign(user, secret.secretToken, { expiresInMinutes: 60 });

            return res.json({token:token});
        });

    });
};
