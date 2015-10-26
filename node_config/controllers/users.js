
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
      var options = {
          criteria: { username: fieldValues.username },
          select: 'username hashed_password salt'
      };
      User.load(options, function (err, user) {
        if (err) {
          console.log(err);
          return res.send(401);
        }
        if (!user) {
          console.log("Unknown User");
          return res.send(401);
        }
        if (!user.authenticate(password)) {
          console.log("Invalid Password");
          return res.send(401);
        }else{
          var token = jwt.sign(user, config.secret, { expiresIn: 3600 });
          return res.json({token:token});
        }

      });
      /*User.findOne({username:fieldValues.username}).lean().exec(function(err, user) {
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

      });*/
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
              console.log(err);
              return res.send(401);
            }else{
              console.log("User sAved.");
              return res.redirect('/login');
            }
          });
        }else{
          console.log("User already exists.");
          return res.redirect('/register');
        }

      });
    });
    form.parse(req, function(err, fields, files) {});



    //User.save();
};
