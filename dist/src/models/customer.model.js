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
var CustomerSchema = new _mongoose.default.Schema({
  customer_id: {
    type: String,
    required: true,
    default: _shortid.default.generate
  },
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
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
    },
    zipcode: {
      type: String
    }
  },
  loc: {
    type: {
      type: String
    },
    coordinates: {
      type: Array
    }
  },
  phone: {
    type: String
  },
  orders: [{
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  hired_partners: {
    type: Number
  },
  total_points: {
    type: Number,
    default: 0
  },
  total_orders: {
    type: Number,
    default: 0
  },
  service_search_radius: {
    type: Number,
    default: 10
  },
  member_since: {
    type: Date,
    default: Date.now
  },
  profile_photo: {
    type: String
  },
  role: {
    type: String,
    required: true
  }
});
/**
 * Statics
 */

CustomerSchema.statics = {
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
  addToOrderList: function addToOrderList(id, order_id) {
    var update = {
      $push: {
        orders: _mongoose.default.Types.ObjectId(order_id)
      }
    };
    return this.findByIdAndUpdate(id, update, {
      new: true
    }).exec().then(function (order) {
      return order;
    });
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
  getById: function getById(id) {
    return this.findOne({
      _id: id
    }, 'customer_id first_name last_name email address loc phone total_points service_search_radius member_since profile_photo').exec().then(function (customer) {
      if (customer) {
        return customer;
      }

      var err = new _APIError.default('No such profile exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  getOrders: function getOrders(id) {
    return this.findOne({
      _id: id
    }, 'orders').populate('orders').exec().then(function (customer) {
      if (customer) {
        if (customer.orders.length <= 0) {
          return [];
        }

        return customer.orders.sort(function (a, b) {
          return new Date(a.order_schedule_date) - new Date(b.order_schedule_date);
        });
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
  updatePhoto: function updatePhoto(id, photo_url) {
    return this.findByIdAndUpdate(id, {
      $set: {
        profile_photo: photo_url
      }
    }, {
      new: true
    }).exec().then(function (customer) {
      if (customer) {
        return customer;
      }

      var err = new _APIError.default('No such profile exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  updateNumOfOrders: function updateNumOfOrders(id) {
    return this.findOneAndUpdate({
      _id: id
    }, {
      $inc: {
        total_orders: 1
      }
    }, {
      new: true
    }).exec().then(function (customer) {
      if (customer) {
        return customer;
      }

      var err = new _APIError.default('No such partner exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
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
 * @typedef Customer
 */

var _default = _mongoose.default.model('Customer', CustomerSchema);

exports.default = _default;
//# sourceMappingURL=customer.model.js.map
