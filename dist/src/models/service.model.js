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
 * Service Schema
 */
var ServiceSchema = new _mongoose.default.Schema({
  category: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Category'
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  image_url: {
    type: String
  },
  status: {
    type: Number,
    default: 1
  }
});
/**
 * Statics
 */

ServiceSchema.statics = {
  /**
   * List services
   * @param {number} skip - Number of services to be skipped.
   * @param {number} limit - Limit services to be returned.
   * @returns {Promise<Service[]>}
   */
  getServices: function getServices() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$skip = _ref.skip,
        skip = _ref$skip === void 0 ? 0 : _ref$skip,
        _ref$limit = _ref.limit,
        limit = _ref$limit === void 0 ? 50 : _ref$limit,
        _ref$status = _ref.status,
        status = _ref$status === void 0 ? 1 : _ref$status;

    return this.find({
      status: status
    }).skip(+skip).limit(+limit).populate({
      path: 'category',
      select: 'name image_url'
    }).exec();
  },
  getServicesByCategory: function getServicesByCategory(categoryId) {
    return this.find({
      category: categoryId
    }).populate({
      path: 'category',
      select: 'name image_url'
    }).exec();
  },

  /**
  * Get service
  * @param {String} serviceId - The id of service.
  * @returns {Promise<Service, APIError>}
  */
  get: function get(serviceId) {
    return this.findOne({
      _id: serviceId
    }).populate({
      path: 'category',
      select: 'name image_url'
    }).exec().then(function (service) {
      if (service) {
        return service;
      }

      var err = new _APIError.default('No such service exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  getMatchedServices: function getMatchedServices(limit, skip, serviceMatchString) {
    return this.find({
      "name": {
        $regex: serviceMatchString,
        $options: "i"
      }
    }, 'name description image_url').skip(+skip).limit(+limit).exec().then(function (services) {
      return services;
    });
  },
  updateServicePhoto: function updateServicePhoto(id, photo_url) {
    return this.findOneAndUpdate({
      _id: id
    }, {
      $set: {
        image_url: photo_url
      }
    }, {
      new: true
    }).exec().then(function (service) {
      if (service) {
        return service;
      }

      var err = new _APIError.default('No such profile exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  }
};
/**
 * @typedef Service
 */

var _default = _mongoose.default.model('Service', ServiceSchema);

exports.default = _default;
//# sourceMappingURL=service.model.js.map
