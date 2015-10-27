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
          console.log("Drag Painting"+dragPainting.rank);

          //use promises
          var dropPainting;
          Painting.load(ids.dropid,function(err,painting){
            if (err) {
              console.log(err);
              return res.send(401);
            }
            if(painting){
              dropPainting = painting;
              console.log("Drop Painting"+dropPainting.rank);

              dragPainting.rank = dropPainting.rank;
              //now every painting with a ranking >= drop rank +1.
              console.log("a:Drag Rank:"+dragPainting.rank+"  Drop Rank:"+dropPainting.rank);
              Painting.where('rank').gte(dropPainting.rank).update({ $inc: { rank: 1 }}, function (err, count) {
                if(err){
                  console.log(err);
                  return res.send(401);
                }
                dragPainting.save();
                console.log(count+" << count of updated rows... b:Drag Rank:"+dragPainting.rank+"  Drop Rank:"+dropPainting.rank);
              });
              console.log("c:Drag Rank:"+dragPainting.rank+"  Drop Rank:"+dropPainting.rank);
              //Painting.update(query.where('rank').gte(dropPainting.rank),{ $inc: { rank: 1 }},{ multi: true },function(){});
              //set drag rank to drop rank
               //hmmm not sure this will work
              console.log("e:Drag Rank:"+dragPainting.rank+"  Drop Rank:"+dropPainting.rank);
              return res.json({message:"Drag Rank:"+dragPainting.rank+"  Drop Rank:"+dropPainting.rank});
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
