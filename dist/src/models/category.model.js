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
 * Category Schema
 */
var CategorySchema = new _mongoose.default.Schema({
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

CategorySchema.statics = {
  /**
   * @param {number} skip - Number of ServiceType to be skipped.
   * @param {number} limit - Limit ServiceType to be returned.
   * @returns {Promise<ServiceType[]>}
   */
  list: function list() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$skip = _ref.skip,
        skip = _ref$skip === void 0 ? 0 : _ref$skip,
        _ref$limit = _ref.limit,
        limit = _ref$limit === void 0 ? 50 : _ref$limit;

    return this.find().skip(+skip).limit(+limit).exec();
  },
  get: function get(id) {
    return this.findOne({
      _id: id
    }).exec().then(function (category) {
      if (category) {
        return category;
      }

      var err = new _APIError.default('No such service type exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  },
  // getSubCategory(id) {
  //   return this.findOne({ 'sub_categories._id': id })
  //     .exec()
  //     .then((serviceType) => {
  //       if (serviceType) {
  //         return serviceType;
  //       }
  //       const err = new APIError('No such service type exists!', httpStatus.NOT_FOUND);
  //       return Promise.reject(err);
  //     });
  // },
  // getMatchedTypes(serviceMatchString) {
  //   return this.find({'$or': [{ "name": { "$regex": serviceMatchString, "$options": "i" } },
  //   { "sub_categories.name": { "$regex": serviceMatchString, "$options": "i" } }]})
  //     .exec()
  //     .then(serviceTypes => serviceTypes)
  // },
  // addSubCategory(categoryId, subCategory) {
  //   return this.findOneAndUpdate({ _id: categoryId }, { $push: { sub_categories: subCategory } }, { new: true })
  //     .exec()
  //     .then((category) => {
  //       if (category) {
  //         return category;
  //       }
  //       const err = new APIError('No such profile exists!', httpStatus.NOT_FOUND);
  //       return Promise.reject(err);
  //     });
  // },
  updateCategoryPhoto: function updateCategoryPhoto(id, photo_url) {
    return this.findOneAndUpdate({
      _id: id
    }, {
      $set: {
        image_url: photo_url
      }
    }, {
      new: true
    }).exec().then(function (category) {
      if (category) {
        return category;
      }

      var err = new _APIError.default('No such profile exists!', _httpStatus.default.NOT_FOUND);
      return _bluebird.default.reject(err);
    });
  }
};
/**
 * @typedef ServiceType
 */

var _default = _mongoose.default.model('Category', CategorySchema);

exports.default = _default;
//# sourceMappingURL=category.model.js.map
