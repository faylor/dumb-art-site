
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
      console.log("THIS IS WHAT IS FOUND:::>>"+field+"   "+value);
      console.log("THIS IS WHAT IS FOUND:::>>"+field+"  "+value);
      fieldValues[field]=value;
    });
    form.parse(req, function(err, fields, files) {});

    if (fieldValues.username == '' || fieldValues.password == '') {
        return res.send(401);
    }
    console.log("THIS IS WHAT IS FOUND:::>>"+fieldValues.username);
    console.log("THIS IS WHAT IS FOUND:::>>"+fieldValues.password);

    User.find({ username: fieldValues.username }).limit(1).lean().exec(function(err, doc) {
      if (err) {
        console.log(err);
        return res.send(401);
      }
      if (doc) {
        // doc may be null if no document matched
        console.log(doc.password);
        console.log(doc[0].password);
      }
        console.log(JSON.stringify(docs));
    });


    var query  = User.where({ username: fieldValues.username });
    query.findOne(function (err, doc) {
      if (err) {
        console.log(err);
        return res.send(401);
      }
      if (doc) {
        // doc may be null if no document matched
        console.log(doc.toObject().username);
        console.log(doc.toObject().password);
      }
    });

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
    })
    form.parse(req, function(err, fields, files) {});

    if (username == '' || password == '') {
        return res.send(401);
    }
    console.log("THIS IS WHAT IS FOUND:::>>"+fieldValues.username);
    console.log("THIS IS WHAT IS FOUND:::>>"+fieldValues.password);
    User.findOne({username: fieldValues.username}, function (err, user) {
        if (err) {
            console.log(err);
            return res.send(401);
        }
    });
    //User.save();
};
