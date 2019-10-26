"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bluebird = _interopRequireDefault(require("bluebird"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _httpStatus = _interopRequireDefault(require("http-status"));

var _shortid = _interopRequireDefault(require("shortid"));

var _isEmail = _interopRequireDefault(require("validator/lib/isEmail"));

var _APIError = _interopRequireDefault(require("../helpers/APIError"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Customer Schema
 */
var AdminSchema = new _mongoose.default.Schema({
  admin_id: {
    type: String,
    required: true,
    default: _shortid.default.generate
  },
  name: {
    type: String
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate: [_isEmail.default, 'Please fill a valid email address']
  },
  address: {
    street: {
      type: String
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
    country: {
      type: String
    }
  },
  phone: {
    type: String
  }
});
/**
 * Statics
 */

AdminSchema.statics = {
  /**
   * List members in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of profiles to be skipped.
   * @param {number} limit - Limit profiles to be returned.
   * @returns {Promise<Profile[]>}
   */
  list: function list() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$skip = _ref.skip,
        skip = _ref$skip === void 0 ? 0 : _ref$skip,
        _ref$limit = _ref.limit,
        limit = _ref$limit === void 0 ? 50 : _ref$limit;

    return this.find().sort({
      createdAt: -1
    }).skip(+skip).limit(+limit).exec();
  },
  get: function get(id) {
    return this.findOne({
      _id: id
    }).exec().then(function (customer) {
      if (customer) {
        return customer;
      }

      var err = new _APIError.default('No such profile exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  getByEmailOrPhone: function getByEmailOrPhone(email, phone) {
    return this.findOne({
      $or: [{
        email: email
      }, {
        phone: phone
      }]
    }).exec().then(function (customer) {
      if (customer) {
        return customer;
      } //user already exists with email AND/OR phone.
      else {
          return null;
        } //no users with that email NOR phone exist.

    });
  },

  /**
   * Remove customers
   * @param {string[]} selectedCustomerIds - The array of customer_id.
   * @returns {Promise<Object, APIError>}
   */
  removeSelectedMembers: function removeSelectedMembers(selectedCustomerIds) {
    return this.remove().where('customer_id').in(selectedCustomerIds).exec();
  }
};
/**
 * @typedef Admin
 */

var _default = _mongoose.default.model('Admin', AdminSchema);

exports.default = _default;
//# sourceMappingURL=admin.model.js.map
