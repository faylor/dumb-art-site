var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// User schema
var Page = new Schema({
    menutitle: { type: String, default: '' },
    menulink: { type: String, default: '' },
    heading: { type: String, default: '' },
    subheading: { type: String, default: ''},
    body: { type: String, default: '' },
    footer: { type: String, default: '' },
    image: { type: String, default: '' }
});

Page.methods = {
};

Page.statics = {

  /**
   * Load
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  load: function (options, cb) {
    options.select = options.select || 'menulink';
    this.findOne(options.criteria)
      .select(options.select)
      .exec(cb);
  }
}
mongoose.model('Page', Page);
