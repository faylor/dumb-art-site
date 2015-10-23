/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
var Painting = mongoose.model('Painting')


/**
 * List
 */

exports.index = function (req, res){
  var page = (req.params.page > 0 ? req.params.page : 1) - 1;
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
  });
};
