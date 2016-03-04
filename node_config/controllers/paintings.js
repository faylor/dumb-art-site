/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Painting = mongoose.model('Painting');
var formidable = require('formidable');
var fse = require('fs-extra');
var quickthumb  = require('quickthumb');
var config = require('../config');
/**
 * List
 */
exports.index = function (req, res){
  Painting.find()
      .sort('rank','-createdAt')
      .populate('themes')
      .lean()
      .exec(function(err, docs) {
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

exports.getSinglePainting = function(req, res){
  if(req.params.id){
    var p = Painting.findOne({ _id:req.params.id },function(err, painting) {
        if(err){
          console.log(err);
          return res.json({error:err});
        }
        if(painting){
          return res.json(painting);
        }
    });
  }else{
    return res.send(404, { error: "Painting was not deleted, missing id." });
  }
};

exports.updateDataAndFile = function (req, res){
  var form = new formidable.IncomingForm();
  var fieldValues={};
  form.on('field', function(field, value) {
    fieldValues[field]=value;
  })
  .on('end', function(fields, files) {

      var file_name = "";
      if(this.openedFiles[0]){

        var temp_path = this.openedFiles[0].path;
        file_name = this.openedFiles[0].name;

        var imagedir = config.imagedir;
        if(process.env.NODE_ENV=="dev")  imagedir = '/Users/jamestaylor/development/ditaylor/devimages/';
        fse.copy(temp_path, imagedir + file_name, function(err) {
            if (err) {
              console.error(err);
            } else {
              quickthumb.convert({
                src: imagedir + file_name,
                dst: imagedir + "thumbs/" + file_name,
                width: 450
              }, function (err, path) {
                if (err) {
                  console.error(err);
                  return res.send(401);
                }
              });
            }
        });
      }
      if(req.params.id=='undefined' || !req.params.id){
          var newPainting = new Painting({title:fieldValues.title,
                                          size:fieldValues.size,
                                          price:fieldValues.price,
                                          sold:fieldValues.sold,
                                          rank:1,
                                          image:file_name,
                                          themes:JSON.parse(fieldValues.themes),
                                          landscape:fieldValues.landscape});


          newPainting.save(function (err) {
            if (err) {
              console.log(err);
              return res.send(401);
            }else{
              console.log('success');
              return res.json({message:"Painting Created Successfully."});
            }
          });
      }else{
          console.log('updating');
          Painting.update({ _id: req.params.id }, {title:fieldValues.title,
                                          size:fieldValues.size,
                                          price:fieldValues.price,
                                          sold:fieldValues.sold,
                                          rank:fieldValues.rank,
                                          image:fieldValues.image,
                                          themes:JSON.parse(fieldValues.themes),
                                          landscape:fieldValues.landscape}, {upsert: true}, function(err) {
              if (!err) {
                  return res.json({message:"updated:"+fieldValues.image});
              } else {
                  console.log(err);
                  return res.send(404, { error: "Painting was not updated." });
              }
        });
      }
  });
  form.parse(req, function(err, fields, files) {});
};

exports.update = function (req, res){
  var body = "";
  req.on('data', function(data){
      body += data.toString();
  });
  req.on('end', function () {
    console.log(body);
    var painting = JSON.parse(body);
    delete painting._id;
    if(req.params.id){
      Painting.update({ _id: req.params.id }, painting, {upsert: true}, function(err) {
            if (!err) {
                return res.send("updated");
            } else {
                console.log(err);
                return res.send(404, { error: "Painting was not updated." });
            }
      });
    }else{
      Painting.save(painting, {upsert: true}, function(err) {
            if (!err) {
                return res.send("inserted");
            } else {
                console.log(err);
                return res.send(404, { error: "Painting was not inserted." });
            }
      });
    }
  });
};

exports.deletePainting = function(req, res){
  if(req.params.id){
    var p = Painting.findOne({ _id:req.params.id },function(err, painting) {
        if(err){
          console.log(err);
          return res.json({error:err});
        }
        if(painting){
          painting.remove();
          return res.json({message:"Painting removed."});
        }
    });
  }else{
    return res.send(404, { error: "Painting was not deleted, missing id." });
  }
};

exports.updateRanking = function (req, res){
  var body = "";
  req.on('data', function(data){
      body += data.toString();
  });
  req.on('end', function () {
    var ids = JSON.parse(body);
    if (ids.dragid && ids.dropid){
      console.log(ids.dragid);
      console.log(ids.dropid);
      if(ids.dragid == ids.dropid){
        return res.json({message:"Same ids, no action."});
      }
      var dragPainting;
      Painting.load(ids.dragid,function(err,painting){
        if (err) {
          console.log(err);
          return res.send(401);
        }
        if(painting){
          dragPainting = painting;

          if(ids.dropid=='last'){
            //get max rank + 1
            Painting.findOne()
                .sort('-rank')
                .limit(1)
                .exec(function(err, doc)
                {
                  if (err) {
                    console.log(err);
                    return res.send(401);
                  }
                  var max = doc.rank;
                  dragPainting.rank = max + 1
                  dragPainting.save();
                  return module.exports.index(req, res);
                }
            );
          }else{

            //use promises
            var dropPainting;
            Painting.load(ids.dropid,function(err,painting){
              if (err) {
                console.log(err);
                return res.send(401);
              }
              if(painting){
                dropPainting = painting;
                console.log("a:Drag Rank:"+dragPainting.rank+"  Drop Rank:"+dropPainting.rank);

                var newRank = dropPainting.rank;
                dragPainting.rank = 0; //Do this to make sure its not in the way
                dragPainting.save();
                //now every painting with a ranking >= drop rank +1.
                console.log("b:Drag Rank:"+dragPainting.rank+"  Drop Rank:"+dropPainting.rank);

                Painting.update({'rank':{"$gte":newRank}},{ $inc: { rank: 1 }},{multi: true}, function (err, count) {
                  if(err){
                    console.log(err);
                    return res.send(401);
                  }
                  dragPainting.rank = newRank; //Replacing the orginal spot
                  dragPainting.save();
                  return module.exports.index(req, res);
                });
              }else{
                console.log("Drop Painting not found");
                return res.send(401);
              }
            });
          }
        }else{
          console.log("Drag Painting not found");
          return res.send(401);
        }
      });

    }else{
      return res.status(500).json({message:"Drag Drop failed, no ids found."});
    }
  });


};
