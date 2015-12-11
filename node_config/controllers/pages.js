
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var formidable  = require('formidable');

var Page = mongoose.model('Page');
var config = require('../config');

exports.index = function (req, res){
  Page.find().lean().exec(function(err, docs) {
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

exports.getPageByMenuLink = function (req, res){
  if(req.params.menulink){

    Page.findOne({menulink:req.params.menulink},function(err, page) {
        if(err){
          console.log(err);
          return res.json({error:err});
        }
        if(page){
          console.log(page);
          return res.json(page);
        }
    });
  }else{
    return res.send(404, { error: "Page was not found." });
  }
};

exports.update = function (req, res){
  var body = "";
  req.on('data', function(data){
      body += data.toString();
  });
  req.on('end', function () {
    console.log(body);
    var page = JSON.parse(body);
    delete page._id;
    if(req.params.id=='undefined' || !req.params.id){
      var newPage = new Page(page);
      newPage.save(function (err) {
        if (err) {
          console.log(err);
          return res.send(401);
        }else{
          return res.json({message:"Page Created Successfully."});
        }
      });
    }else{
      Page.update({ _id: req.params.id }, page, {upsert: true}, function(err) {
            if (!err) {
                return res.send("updated");
            } else {
                console.log(err);
                return res.send(404, { error: "Page was not updated." });
            }
      });
    }
  });
};


exports.deletePage = function(req, res){
  if(req.params.id){
    var p = Page.findOne({ _id:req.params.id },function(err, page) {
        if(err){
          console.log(err);
          return res.json({error:err});
        }
        if(page){
          page.remove();
          return res.json({message:"Page removed."});
        }
    });
  }else{
    return res.send(404, { error: "Page was not deleted, missing id." });
  }
};
