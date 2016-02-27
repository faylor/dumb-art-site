var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// User schema
var Theme = new Schema({
    theme: { type: String, default: '' },
    rank: {type : Number, default : 999}
});

Theme.methods = {
};

Theme.statics = {

  /**
   * Load
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  load: function (options, cb) {
    options.select = options.select || 'theme';
    this.findOne(options.criteria)
      .select(options.select)
      .exec(cb);
  }
}
mongoose.model('Theme', Theme);
