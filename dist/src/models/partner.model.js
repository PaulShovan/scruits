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
 * Partner Schema
 */
var PartnerSchema = new _mongoose.default.Schema({
  partner_id: {
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
    street: String,
    city: String,
    state: String,
    country: String,
    zipcode: String
  },
  loc: {
    type: {
      type: String
    },
    coordinates: []
  },
  phone: String,
  orders: [{
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  total_earned: {
    type: Number,
    default: 0
  },
  business_hours: {
    from: String,
    to: String
  },
  offers: [{
    offer_id: String,
    offer_details: String,
    offer_valid_from: Date,
    offer_valid_to: Date,
    offer_amount: Number
  }],
  quotes: [{
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Quote'
  }],
  images: [],
  credits: {
    type: Number,
    default: 0
  },
  bio: String,
  services_radius: {
    type: Number,
    default: 10
  },
  can_goto_customer_location: {
    type: Boolean,
    default: false
  },
  reviews: [{
    reviewed_by: {
      type: _mongoose.default.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    order: {
      type: _mongoose.default.Schema.Types.ObjectId,
      ref: 'Order'
    },
    star: Number,
    description: String
  }],
  accociated_category: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Category'
  },
  accociated_services: [{
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  profile_photo: {
    type: String
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

PartnerSchema.statics = {
  /**
   * List partners in descending order of 'createdAt' timestamp.
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
    }, 'first_name last_name email address loc phone business_hours images profile_photo credits bio reviews').exec().then(function (partner) {
      if (partner) {
        partner.profile_photo = partner.profile_photo || "";
        return partner;
      }

      var err = new _APIError.default('No such partner exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  addToQuoteList: function addToQuoteList(id, quote_id) {
    var update = {
      $push: {
        quotes: _mongoose.default.Types.ObjectId(quote_id)
      }
    };
    return this.findByIdAndUpdate(id, update, {
      new: true
    }).exec().then(function (partner) {
      return partner;
    });
  },
  getById: function getById(id) {
    return this.findOne({
      _id: id
    }, 'first_name last_name email address phone business_hours images profile_photo credits bio loc accociated_category can_goto_customer_location services_radius').exec().then(function (partner) {
      if (partner) {
        partner.accociated_category = partner.accociated_category || "";
        partner.profile_photo = partner.profile_photo || "";
        return partner;
      }

      var err = new _APIError.default('No such profile exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  getReviews: function getReviews(id) {
    return this.findOne({
      _id: id
    }, 'reviews').populate({
      path: 'reviews.reviewed_by',
      select: 'first_name last_name profile_photo -_id'
    }).populate({
      path: 'reviews.order',
      select: 'service -_id'
    }).exec().then(function (partner) {
      if (partner) {
        return partner;
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
    }).exec().then(function (partner) {
      if (partner) {
        return partner;
      } //user already exists with email AND/OR phone.
      else {
          return null;
        } //no users with that email NOR phone exist.

    });
  },
  addReview: function addReview(id, review) {
    return this.findOneAndUpdate({
      _id: id
    }, {
      $push: {
        reviews: review
      }
    }, {
      new: true
    }).exec().then(function (partner) {
      if (partner) {
        return partner;
      }

      var err = new _APIError.default('No such partner exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  updateTotalEarned: function updateTotalEarned(id, value) {
    return this.findOneAndUpdate({
      _id: id
    }, {
      $inc: {
        total_earned: value
      }
    }, {
      new: true
    }).exec().then(function (partner) {
      if (partner) {
        return partner;
      }

      var err = new _APIError.default('No such partner exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  updatePhoto: function updatePhoto(id, photo_urls) {
    return this.findByIdAndUpdate(id, {
      $addToSet: {
        images: {
          $each: photo_urls
        }
      }
    }, {
      new: true
    }).exec().then(function (partner) {
      if (partner) {
        return partner.images;
      }

      var err = new _APIError.default('No such profile exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  updateProfilePhoto: function updateProfilePhoto(id, photo_url) {
    return this.findByIdAndUpdate(id, {
      $set: {
        profile_photo: photo_url
      }
    }, {
      new: true
    }).exec().then(function (partner) {
      if (partner) {
        return partner;
      }

      var err = new _APIError.default('No such profile exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  addOrder: function addOrder(id, order_id) {
    return this.findOneAndUpdate({
      _id: id
    }, {
      $push: {
        orders: order_id
      }
    }, {
      new: true
    }).exec().then(function (partner) {
      if (partner) {
        return partner;
      }

      var err = new _APIError.default('No such partner exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  associateServices: function associateServices(id, services) {
    return this.findByIdAndUpdate(id, {
      $addToSet: {
        accociated_services: {
          $each: services
        }
      }
    }, {
      new: true
    }).exec().then(function (partner) {
      if (partner) {
        return partner;
      }

      var err = new _APIError.default('No such profile exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  getAssociatedServices: function getAssociatedServices(id) {
    return this.findOne({
      _id: id
    }, 'accociated_services').populate({
      path: 'accociated_services',
      select: 'name description image_url'
    }).exec().then(function (services) {
      if (services) {
        return services;
      }

      var err = new _APIError.default('No such profile exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  removeAssociatedService: function removeAssociatedService(id, service) {
    return this.findOneAndUpdate({
      _id: id
    }, {
      $pull: {
        accociated_services: service
      }
    }, {
      new: true
    }).exec().then(function (partner) {
      if (partner) {
        return partner;
      }

      var err = new _APIError.default('No such partner exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  getPartnerOrders: function getPartnerOrders(id) {
    return this.findOne({
      _id: id
    }, 'orders').populate({
      path: 'orders',
      select: 'time_range service request_budget order_status order_schedule_date customer',
      populate: {
        path: 'customer',
        select: 'first_name last_name'
      }
    }).exec().then(function (orders) {
      if (orders) {
        return orders.orders.sort(function (a, b) {
          return new Date(a.order_schedule_date) - new Date(b.order_schedule_date);
        });
      }

      var err = new _APIError.default('No such profile exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },

  /**
   * Remove partners
   * @param {string[]} selectedPartnerIds - The array of profile_id.
   * @returns {Promise<Object, APIError>}
   */
  removeSelectedMembers: function removeSelectedMembers(selectedPartnerIds) {
    return this.remove().where('partner_id').in(selectedPartnerIds).exec();
  }
};
/**
 * @typedef Partner
 */

var _default = _mongoose.default.model('Partner', PartnerSchema);

exports.default = _default;
//# sourceMappingURL=partner.model.js.map
