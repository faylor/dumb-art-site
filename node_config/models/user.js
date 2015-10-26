var mongoose = require('mongoose');
var crypto = require('crypto');
var Schema = mongoose.Schema;
// User schema
var User = new Schema({
    username: { type: String, required: true, unique: true },
    hashed_password: { type: String, required: true},
    salt: { type: String, default: '' }
});

User
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function() { return this._password });

  var validatePresenceOf = function (value) {
    return value && value.length;
  };

User.pre('save', function(next) {
  if (!this.isNew) return next();

  if (!validatePresenceOf(this.password)) {
    next(new Error('Invalid password'));
  } else {
    next();
  }
});

User.methods = {

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function (plainText) {
    console.log('authenticate:'+plainText);
    console.log('authenticate:'+this.encryptPassword(plainText));
    console.log(this.hashed_password);

    return this.encryptPassword(plainText) === this.hashed_password;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function () {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function (password) {
    if (!password) return '';
    try {
      return crypto
        .createHmac('sha1', this.salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      return '';
    }
  }
};

User.statics = {

  /**
   * Load
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  load: function (options, cb) {
    options.select = options.select || 'username';
    this.findOne(options.criteria)
      .select(options.select)
      .exec(cb);
  }
}
mongoose.model('User', User);
