
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var formidable  = require('formidable');
var jwt = require('jsonwebtoken');

var User = mongoose.model('User');
var config = require('../config');

exports.login = function (req, res) {
    var username = '';
    var password = '';
    var form = new formidable.IncomingForm();
    var fieldValues={};
    form.on('field', function(field, value) {
      fieldValues[field]=value;
    }).
    on('end', function(fields, files) {
      if(fieldValues.username == '' || fieldValues.password == '') {
          return res.send(401);
      }
      User.findOne({username:fieldValues.username}).lean().exec(function(err, user) {
        if (err) {
          console.log(err);
          return res.send(401);
        }
        if (user) {
          if(user.authenticate(password)){

          //if(user.password==fieldValues.password){
            var token = jwt.sign(user, config.secret, { expiresIn: 3600 });

            return res.json({token:token});
          }
        }

      });
    });
    form.parse(req, function(err, fields, files) {});

/*
    User.findOne({username: fieldValues.username}, function (err, obj) {
        if (err) {
            console.log(err);
            return res.send(401);
        }
        var user = obj.toObject();
        console.log("username>>"+user.username);
        console.log("username>>"+user.password);
        if(user.password==fieldValues.password){
          var token = jwt.sign(user, secret.secretToken, { expiresInMinutes: 60 });

          return res.json({token:token});
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
    */
};


exports.save = function (req, res) {
    var username = '';
    var password = '';
    var form = new formidable.IncomingForm();
    var fieldValues={};
    form.on('field', function(field, value) {
      fieldValues[field]=value;
    }).
    on('end', function(fields, files) {
      if(fieldValues.username == '' || fieldValues.password == '') {
          return res.send(401);
      }
      User.findOne({username:fieldValues.username}).lean().exec(function(err, user) {
        if (err) {
          console.log(err);
          return res.send(401);
        }
        if (!user) {
          var newUser = new User({username:fieldValues.username,password:fieldValues.password});
          newUser.save(function (err) {
            if (err) {
              return res.render('/register', {
                errors: utils.errors(err.errors),
                user: user,
                title: 'Sign up'
              });
            }
          });
        }else{
          //res.write("User already exists.");
        }

      });
    });
    form.parse(req, function(err, fields, files) {});



    //User.save();
};
