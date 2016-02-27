
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var formidable  = require('formidable');

var Theme = mongoose.model('Theme');
var config = require('../config');

exports.index = function (req, res){
  Theme.find().lean().exec(function(err, docs) {
      if(err){
        console.log(err);
        return res.json({error:err});
      }
      if(docs){
        return res.json(docs);
      }else{
        return res.json({});
      }
  });
};

exports.update = function (req, res){
  var body = "";
  req.on('data', function(data){
      body += data.toString();
  });
  req.on('end', function () {
    var theme = JSON.parse(body);
    delete theme._id;
    if(req.params.id=='undefined' || !req.params.id){
      var newTheme = new Theme(theme);
      newTheme.save(function (err) {
        if (err) {
          console.log(err);
          return res.send(401);
        }else{
          return res.json({message:"Theme Created Successfully."});
        }
      });
    }else{
      console.log('>>>>>>>>>>>>'+theme.rank);
      Theme.update({ _id: req.params.id }, theme, {upsert: true}, function(err) {
            if (!err) {
                return res.send("updated");
            } else {
                console.log(err);
                return res.send(404, { error: "Theme was not updated." });
            }
      });
    }
  });
};


exports.deleteTheme = function(req, res){
  if(req.params.id){
    var p = Theme.findOne({ _id:req.params.id },function(err, theme) {
        if(err){
          console.log(err);
          return res.json({error:err});
        }
        if(theme){
          theme.remove();
          return res.json({message:"Theme removed."});
        }
    });
  }else{
    return res.send(404, { error: "Theme was not deleted, missing id." });
  }
};
