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

exports.update = function (req, res){
  var body = "";
  req.on('data', function(data){
      body += data.toString();
  });
  req.on('end', function () {
    var painting = JSON.parse(body);
    delete painting._id;
    Painting.update({ _id: req.params.id }, painting, {upsert: true}, function(err) {
          if (!err) {
              return res.send("updated");
          } else {
              console.log(err);
              return res.send(404, { error: "Painting was not updated." });
          }
    });
  });
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
                Painting.find().lean().exec(function(err, docs) {
                    res.header("Content-Type:","text/json");
                    res.end(JSON.stringify(docs));
                });
              });
            }else{
              console.log("Drop Painting not found");
              return res.send(401);
            }
          });

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
