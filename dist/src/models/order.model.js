"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bluebird = _interopRequireDefault(require("bluebird"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _httpStatus = _interopRequireDefault(require("http-status"));

var _APIError = _interopRequireDefault(require("../helpers/APIError"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Order Schema
 */
var OrderSchema = new _mongoose.default.Schema({
  customer: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  order_create_time: {
    type: Date,
    default: Date.now
  },
  order_schedule_date: {
    type: Date,
    default: Date.now
  },
  time_range: {
    start: {
      type: String
    },
    end: {
      type: String
    }
  },
  service: {
    id: {
      type: _mongoose.default.Schema.Types.ObjectId,
      ref: 'Service'
    },
    name: {
      type: String
    },
    request_message: {
      type: String
    }
  },
  request_budget: {
    min: {
      type: Number
    },
    max: {
      type: Number
    }
  },
  payment_details: {
    transaction_id: String,
    amount: Number,
    currency: {
      type: String,
      default: 'CAD'
    },
    payment_type: String,
    status: {
      type: Number,
      default: 1
    }
  },
  quotes: [{
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Quote'
  }],
  appointed_partner: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Partner'
  },
  appointed_price: {
    amount: {
      type: Number
    },
    currency: {
      type: String
    }
  },
  order_status: {
    type: Number,
    default: 1
  },
  partners_to_quote: [{
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Partner'
  }],
  partners_quoted: [{
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Partner'
  }],
  rejected_partners: [{
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Partner'
  }]
});
/**
 * Statics
 */

OrderSchema.statics = {
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
        limit = _ref$limit === void 0 ? 50 : _ref$limit,
        _ref$status = _ref.status,
        status = _ref$status === void 0 ? 1 : _ref$status;

    return this.find({
      order_status: status
    }).sort({
      order_schedule_date: -1
    }).skip(+skip).limit(+limit).exec();
  },
  get: function get(id) {
    return this.findOne({
      _id: id
    }).exec().then(function (order) {
      if (order) {
        return order;
      }

      var err = new _APIError.default('No such order exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  getOrderFull: function getOrderFull(id) {
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
  addToQuoteList: function addToQuoteList(id, quote_id, partner_id) {
    console.log(partner_id);
    var update = {
      $push: {
        quotes: _mongoose.default.Types.ObjectId(quote_id),
        partners_quoted: partner_id
      }
    };
    return this.findByIdAndUpdate(id, update, {
      new: true
    }).exec().then(function (quote) {
      return quote;
    });
  },
  addToPartnerToQuoteList: function addToPartnerToQuoteList(id, partners) {
    return this.findByIdAndUpdate(id, {
      $addToSet: {
        partners_to_quote: {
          $each: partners
        }
      }
    }, {
      new: true
    }).exec().then(function (order) {
      if (order) {
        return order;
      }

      var err = new _APIError.default('No such profile exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  removeFromPartnerToQuoteList: function removeFromPartnerToQuoteList(id, partner) {
    return this.findOneAndUpdate({
      _id: id
    }, {
      $pull: {
        partners_to_quote: partner
      }
    }, {
      new: true
    }).exec().then(function (order) {
      if (order) {
        return order;
      }

      var err = new _APIError.default('No such order exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  addToRejectedPartnerList: function addToRejectedPartnerList(id, partner, quote) {
    return this.findByIdAndUpdate(id, {
      $addToSet: {
        rejected_partners: partner
      },
      $pull: {
        quotes: quote
      }
    }, {
      new: true
    }).exec().then(function (order) {
      if (order) {
        return order;
      }

      var err = new _APIError.default('No such profile exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  getQuotes: function getQuotes(id) {
    return this.findOne({
      _id: id
    }, 'quotes').populate({
      path: 'quotes',
      populate: {
        path: 'quote_partner',
        select: 'first_name last_name profile_photo'
      }
    }).exec().then(function (quotes) {
      if (quotes) {
        return quotes;
      }

      var err = new _APIError.default('No such order exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  updatePayment: function updatePayment(id, payment) {
    return this.findOneAndUpdate({
      _id: id
    }, {
      $set: {
        payment_details: payment,
        order_status: 3
      }
    }, {
      new: true
    }).exec().then(function (order) {
      if (order) {
        return order;
      }

      var err = new _APIError.default('No such order exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  updateAppointedPartner: function updateAppointedPartner(id, partner, price) {
    return this.findOneAndUpdate({
      _id: id
    }, {
      $set: {
        appointed_partner: partner,
        order_status: 2,
        appointed_price: price
      }
    }, {
      new: true
    }).exec().then(function (order) {
      if (order) {
        return order;
      }

      var err = new _APIError.default('No such order exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  lockOrderForQuote: function lockOrderForQuote(id) {
    return this.findOneAndUpdate({
      _id: id
    }, {
      $set: {
        order_status: 4
      }
    }, {
      new: true
    }).exec().then(function (order) {
      if (order) {
        return order;
      }

      var err = new _APIError.default('No such order exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  unlockOrderForQuote: function unlockOrderForQuote(id) {
    return this.findOneAndUpdate({
      _id: id
    }, {
      $set: {
        order_status: 1
      }
    }, {
      new: true
    }).exec().then(function (order) {
      if (order) {
        return order;
      }

      var err = new _APIError.default('No such order exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  getOrdersForPartnerToQuote: function getOrdersForPartnerToQuote(skip, limit, partner) {
    return this.find({
      $and: [{
        partners_to_quote: partner
      }, {
        order_status: {
          $nin: [4, 5]
        }
      }, {
        appointed_partner: {
          $exists: false
        }
      }, {
        rejected_partners: {
          "$ne": partner
        }
      }, {
        partners_quoted: {
          "$ne": partner
        }
      }]
    }, 'service customer order_schedule_date time_range payment_details request_budget').sort({
      order_schedule_date: -1
    }).skip(+skip).limit(+limit).populate({
      path: 'customer',
      select: 'first_name last_name'
    }).exec();
  },
  getOngoingOrders: function getOngoingOrders(skip, limit, partner) {
    return this.find({
      $and: [{
        partners_to_quote: partner
      }, {
        partners_quoted: {
          "$eq": partner
        }
      }, {
        order_status: {
          $nin: [3, 5]
        }
      }, {
        rejected_partners: {
          "$ne": partner
        }
      }]
    }, 'service customer order_schedule_date time_range appointed_price').sort({
      order_schedule_date: -1
    }).skip(+skip).limit(+limit).populate({
      path: 'customer',
      select: 'first_name last_name address phone profile_photo'
    }).populate({
      path: 'quotes',
      select: 'quote_partner'
    }).exec();
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

var _default = _mongoose.default.model('Order', OrderSchema);

exports.default = _default;
//# sourceMappingURL=order.model.js.map
