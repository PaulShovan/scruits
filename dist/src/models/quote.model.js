"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bluebird = _interopRequireDefault(require("bluebird"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _httpStatus = _interopRequireDefault(require("http-status"));

var _shortid = _interopRequireDefault(require("shortid"));

var _APIError = _interopRequireDefault(require("../helpers/APIError"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Quote Schema
 */
var QuoteSchema = new _mongoose.default.Schema({
  order_id: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Order'
  },
  quote_partner: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Partner'
  },
  quote_explanation: {
    type: String,
    required: true
  },
  service_address: {
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
  service_location: {
    type: {
      type: String
    },
    coordinates: {
      type: Array
    }
  },
  price: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'CAD'
    }
  },
  quote_create_time: {
    type: Date,
    default: Date.now
  },
  quote_status: {
    type: Number,
    default: 1
  }
});
/**
 * Statics
 */

QuoteSchema.statics = {
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
    }).exec().then(function (quote) {
      if (quote) {
        return quote;
      }

      var err = new _APIError.default('No such order exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  getQuoteFull: function getQuoteFull(id) {
    return this.findOne({
      _id: id
    }).populate('customer').exec().then(function (order) {
      if (order) {
        return order;
      }

      var err = new _APIError.default('No such order exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  acceptQuote: function acceptQuote(id) {
    return this.findOneAndUpdate({
      _id: id
    }, {
      $set: {
        quote_status: 2
      }
    }, {
      new: true
    }).exec().then(function (quote) {
      if (quote) {
        return quote;
      }

      var err = new _APIError.default('No such quote exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  rejectQuote: function rejectQuote(id) {
    return this.findOneAndUpdate({
      _id: id
    }, {
      $set: {
        quote_status: 3
      }
    }, {
      new: true
    }).exec().then(function (quote) {
      if (quote) {
        return quote;
      }

      var err = new _APIError.default('No such quote exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },

  /**
   * Remove orders
   * @param {string[]} selectedOrderIds - The array of profile_id.
   * @returns {Promise<Object, APIError>}
   */
  removeSelectedMembers: function removeSelectedMembers(selectedOrderIds) {
    return this.remove().where('order_id').in(selectedOrderIds).exec();
  }
};
/**
 * @typedef Order
 */

var _default = _mongoose.default.model('Quote', QuoteSchema);

exports.default = _default;
//# sourceMappingURL=quote.model.js.map
