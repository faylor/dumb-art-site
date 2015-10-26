/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
var Painting = mongoose.model('Painting')

/**
 * List
 */

exports.index = function (req, res){
  Painting.find().lean().exec(function(err, docs) {
      res.header("Content-Type:","text/json");
      res.end(JSON.stringify(docs));
  });
  /*var page = (req.params.page > 0 ? req.params.page : 1) - 1;
  var perPage = 30;
  var options = {
    perPage: perPage,
    page: page
  };

  Painting.list(options, function (err, paintings) {
    if (err) return res.render('500');
    Painting.count().exec(function (err, count) {
      res.render('paintings/index', {
        title: 'Paintings',
        paintings: paintings,
        page: page + 1,
        pages: Math.ceil(count / perPage)
      });
    });
  });*/
};

exports.updateRanking = function (req, res){
  var ids;
  req.on('data', function(data){
      ids = JSON.parse(data);
      console.log(ids.dragid);
      console.log(ids.dropid);
  });
  console.log('out:'+ids.dragid);
  console.log('out:'+ids.dropid);
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
      }else{
        console.log("Drag Painting not found");
        return res.send(401);
      }
    });

    var dropPainting;
    Painting.load(ids.dropid,function(err,painting){
      if (err) {
        console.log(err);
        return res.send(401);
      }
      if(painting){
        dropPainting = painting;
      }else{
        console.log("Drop Painting not found");
        return res.send(401);
      }
    });

    return res.json({message:"Drag Rank:"+dragPainting.rank+"Drop Rank:"+dropPainting.rank});
  }else{
    return res.status(500).json({message:"Drag Drop failed, no ids found."});
  }



};
