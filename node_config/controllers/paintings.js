/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Painting = mongoose.model('Painting');
var formidable = require('formidable');
var fse = require('fs-extra');
var quickthumb  = require('quickthumb');
var config = require('../config');
var async = require('async');
var path = require('path');
const Transform = require('stream').Transform

/* AWS S3 */
const aws = require('aws-sdk');
const S3_BUCKET = process.env.S3_BUCKET;

aws.config.region = config.region;
const s3 = new aws.S3();

/**
 * List
 */
exports.index = function (req, res){
  Painting.find()
      .sort('rank')
      .populate('themes')
      .lean()
      .exec(function(err, docs) {
        if(err){
          console.log('Error getting paintings:' + err);
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
  form.uploadDir = path.join(__dirname, '/uploads');
  form.on('field', function(field, value) {
    fieldValues[field]=value;
  });
  form.on('file', function(field, file) {

  });
  form.on('fileBegin', (name, file) => {
    file.on('error', e => this._error(e))

    file.open = function () {
      this._writeStream =  new Transform({
        transform (chunk, encoding, callback) {callback(null, chunk)}
      })

      this._writeStream.on('error', e => this.emit('error', e))

      s3.upload({
        Bucket: S3_BUCKET,
        Key: file.name,
        Body: this._writeStream,        
        ACL: 'public-read'
      }, onUpload)
/*
          async.waterfall([
                function convert(next){
                  console.log("convert thumb");
                  quickthumb.convert({
                        src: path.join(form.uploadDir, file.name),
                        dst: path.join(form.uploadDir, "thumb" + file.name),
                        width: 450
                      },next)
                  console.log("converted");
                },
                function uploadThumb(next){
                  console.log("upload thumb");
                  var fileStream = fs.createReadStream(path.join(form.uploadDir, "thumb" + file.name));
                  fileStream.on('open', function () {
                    s3.upload({
                      Bucket: S3_BUCKET,
                      Key: "thumb-" + file_name,
                      Body: fileStream
                    }, next);
                  });
                }]
                ,function (err) {
                  if (err) {
                      console.error(
                          'Unable to resize and upload to  due to an error: ' + err
                      );
                  } else {
                      console.log(
                          'Successfully resized and uploaded'
                      );
                  }
                }
          );*/
    }
    file.end = function (cb) {
      this._writeStream.on('finish', () => {
          this.emit('end');
          cb();
      });
      this._writeStream.end();
    }
  })

  .on('end', function(fields, files) {

      var file_name = "";
      var file_type = "";
      if(this.openedFiles[0]){

        var temp_path = this.openedFiles[0].path;
        file_name = this.openedFiles[0].name;
        file_type = this.openedFiles[0].type;


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
                                          image:file_name,
                                          themes:JSON.parse(fieldValues.themes),
                                          landscape:fieldValues.landscape}, {upsert: true},
              function(err) {
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

// continue execution in here
function onUpload (err, res) {
  err ? console.log('error:\n', err) : console.log('response:\n', res);



}

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
