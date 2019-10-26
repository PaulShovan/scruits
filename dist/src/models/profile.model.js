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
 * Profile Schema
 */
var ProfileSchema = new _mongoose.default.Schema({
  profile_id: {
    type: String,
    required: true,
    default: _shortid.default.generate
  },
  first_name: {
    type: String
  },
  last_name: {
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
  },
  number_of_orders: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    required: true
  }
});
/**
 * Statics
 */

ProfileSchema.statics = {
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
      profile_id: id
    }).exec().then(function (profile) {
      if (profile) {
        return profile;
      }

      var err = new _APIError.default('No such profile exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },

  /**
   * Remove profiles
   * @param {string[]} selectedProfileIds - The array of profile_id.
   * @returns {Promise<Object, APIError>}
   */
  removeSelectedMembers: function removeSelectedMembers(selectedProfileIds) {
    return this.remove().where('profile_id').in(selectedProfileIds).exec();
  }
};
/**
 * @typedef Profile
 */

var _default = _mongoose.default.model('Profile', ProfileSchema);

exports.default = _default;
//# sourceMappingURL=profile.model.js.map
