
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
          return res.status(500).json({message:"User not found."});
        }
        if (!user.authenticate(fieldValues.password)) {
          return res.status(500).json({message:"Login Incorrect."});
        }else{
          var token = jwt.sign(user, config.secret, { expiresIn: 3600 });
          return res.json({token:token});
        }

      });
    });
    form.parse(req, function(err, fields, files) {});

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
              return res.json({message:"User Created Successfully."});
            }
          });
        }else{
          return res.json({message:"User already exists."});
        }

      });
    });
    form.parse(req, function(err, fields, files) {});



    //User.save();
};
