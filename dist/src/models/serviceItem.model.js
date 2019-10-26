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
 * Service Item Schema
 */
var ServiceItemSchema = new _mongoose.default.Schema({
  service: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Service'
  },
  partner: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Partner'
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  image_url: {
    type: String
  },
  loc: {
    type: {
      type: String,
      select: false
    },
    coordinates: {
      type: Array,
      select: false
    },
    select: false
  },
  status: {
    type: Number,
    default: 1
  }
});
/**
 * Statics
 */

ServiceItemSchema.statics = {
  /**
   * List services
   * @param {number} skip - Number of services to be skipped.
   * @param {number} limit - Limit services to be returned.
   * @returns {Promise<Service[]>}
   */
  getServiceItems: function getServiceItems() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$skip = _ref.skip,
        skip = _ref$skip === void 0 ? 0 : _ref$skip,
        _ref$limit = _ref.limit,
        limit = _ref$limit === void 0 ? 50 : _ref$limit,
        _ref$status = _ref.status,
        status = _ref$status === void 0 ? 1 : _ref$status;

    return this.find({
      status: status
    }, 'name price description image_url partner').skip(+skip).limit(+limit).populate({
      path: 'partner',
      select: 'name'
    }).exec();
  },
  getServiceItemsByService: function getServiceItemsByService(serviceId) {
    return this.find({
      service: serviceId
    }, 'name price description image_url partner').populate({
      path: 'partner',
      select: 'name'
    }).exec();
  },
  getServiceItemsByPartner: function getServiceItemsByPartner(partnerId) {
    return this.find({
      partner: partnerId
    }, 'name price description image_url').exec();
  },
  getPartnerServiceItemsByServiceId: function getPartnerServiceItemsByServiceId(partnerId, serviceId) {
    return this.find({
      partner: partnerId,
      service: serviceId
    }, 'name price description image_url').exec();
  },
  getServices: function getServices(partnerId) {
    return this.find({
      partner: partnerId
    }, 'service').populate({
      path: 'service',
      select: 'name description'
    }).exec();
  },

  /**
  * Get service
  * @param {String} serviceId - The id of service.
  * @returns {Promise<Service, APIError>}
  */
  get: function get(serviceItemId) {
    return this.findOne({
      _id: serviceItemId
    }, 'name price description image_url partner').populate({
      path: 'partner',
      select: 'name'
    }).exec().then(function (service) {
      if (service) {
        return service;
      }

      var err = new _APIError.default('No such service exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  getMatchedServiceItems: function getMatchedServiceItems(serviceMatchString) {
    return this.find({
      "name": {
        "$regex": serviceMatchString,
        "$options": "i"
      },
      status: 1
    }, 'name price description image_url').exec().then(function (services) {
      return services;
    });
  },
  updateServiceItemPhoto: function updateServiceItemPhoto(id, photo_url) {
    return this.findOneAndUpdate({
      _id: id
    }, {
      $set: {
        image_url: photo_url
      }
    }, {
      new: true
    }).exec().then(function (serviceItem) {
      if (serviceItem) {
        return serviceItem;
      }

      var err = new _APIError.default('No such service item exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  updateLocationOfServiceItem: function updateLocationOfServiceItem(id, location) {
    return this.update({
      partner: id
    }, {
      $set: {
        loc: location
      }
    }, {
      'multi': true
    }).exec().then(function (serviceItem) {
      if (serviceItem) {
        return serviceItem;
      }

      var err = new _APIError.default('No such service item exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  removeServiceItemById: function removeServiceItemById(serviceItemId) {
    return this.findOneAndRemove({
      _id: serviceItemId
    }).exec().then(function (serviceItem) {
      if (serviceItem) {
        return serviceItem;
      }

      var err = new _APIError.default('No such service item exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  removeServiceItemByServiceAndPartnerId: function removeServiceItemByServiceAndPartnerId(service, partner) {
    return this.deleteMany({
      service: service,
      partner: partner
    }).exec().then(function (serviceItem) {
      if (serviceItem) {
        return serviceItem;
      }

      var err = new _APIError.default('No such service item exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  }
};
/**
 * @typedef ServiceItem
 */

var _default = _mongoose.default.model('ServiceItem', ServiceItemSchema);

exports.default = _default;
//# sourceMappingURL=serviceItem.model.js.map
