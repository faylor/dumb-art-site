/**
 * Module dependencies.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;


/**
 * Getters
 */
var getTags = function (tags) {
  return tags.join(',');
};

/**
 * Setters
 */
var setTags = function (tags) {
  return tags.split(',');
};
/**
 * Painting Schema
 */

var PaintingSchema = new Schema({
  title: {type : String, default : '', trim : true},
  body: {type : String, default : '', trim : true},
  size: {type : String, default : '', trim : true},
  price: {type : Number, default : 0},
  tags: {type: [], get: getTags, set: setTags},
  image: {type : String, default : '', trim : true},
  createdAt  : {type : Date, default : Date.now},
  rank: {type : Number, default : 999}
});

/**
 * Validations
 */

PaintingSchema.path('title').required(true, 'Painting title cannot be blank');
PaintingSchema.path('size').required(true, 'Painting size cannot be blank');

/**
 * Pre-remove hook
 */

PaintingSchema.pre('remove', function (next) {
  var files = this.image;

  // if there are files associated with the item, remove from the cloud too

  next();
});

/**
 * Methods
 */

PaintingSchema.methods = {

  /**
   * Save Painting and upload image
   *
   * @param {Object} images
   * @param {Function} cb
   * @api private
   */

  uploadAndSave: function (images, cb) {
    if (!images || !images.length) return this.save(cb)

    //upload here
  }
}

/**
 * Statics
 */

PaintingSchema.statics = {

  /**
   * Find Painting by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

  load: function (id, cb) {
    this.findOne({ _id : id })
      .populate('user', 'name email username')
      .exec(cb);
  },

  /**
   * List Paintings
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  list: function (options, cb) {
    var criteria = options.criteria || {}

    this.find(criteria)
      .populate('user', 'name username')
      .sort({'createdAt': -1}) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb);
  }
}

mongoose.model('Painting', PaintingSchema);
