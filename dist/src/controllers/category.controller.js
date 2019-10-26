"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _underscore = _interopRequireDefault(require("underscore"));

var _category = _interopRequireDefault(require("../models/category.model"));

var _s = require("../services/s3.service");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var singleUpload = _s.upload.single('image');

var add = function add(req, res, next) {
  var category = new _category.default({
    name: req.body.name,
    description: req.body.description
  });
  category.save().then(function (savedCategory) {
    res.status(200).json({
      status: "success",
      result: savedCategory
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error adding category"
    });
  });
}; // const addSubCategory = (req, res, next) => {
//   const subCategory = {
//     name: req.body.name,
//     description: req.body.description,
//     status: req.authUser['custom:role'] === 'admin' ? 1 : 2
//   };
//   Category.addSubCategory(req.category._id, subCategory)
//     .then(savedCategory => {
//       res.status(200).json(savedCategory)
//     })
//     .catch(e => res.status(500).json(e))
// }

/**
 * Get ServiceType
 * @returns {Category}
 */


var getCategory = function getCategory(req, res) {
  return res.status(200).json({
    status: "success",
    result: req.category
  });
};
/**
 * Load service type and append to req.
 */


var loadCategory = function loadCategory(req, res, next, categoryId) {
  _category.default.get(categoryId).then(function (category) {
    req.category = category; // eslint-disable-line no-param-reassign

    return next();
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error loading category"
    });
  });
};
/**
 * update ServiceType
 * @property {Object} req.body - Updated properties
 * @returns {Order}
 */


var update = function update(req, res, next) {
  var category = req.category;
  category = _underscore.default.extend(category, req.body);
  category.save().then(function (savedCategory) {
    return res.status(200).json({
      status: "success",
      result: savedCategory
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error updating category"
    });
  });
};

var getAll = function getAll(req, res, next) {
  var _req$query = req.query,
      _req$query$limit = _req$query.limit,
      limit = _req$query$limit === void 0 ? 50 : _req$query$limit,
      _req$query$skip = _req$query.skip,
      skip = _req$query$skip === void 0 ? 0 : _req$query$skip;

  _category.default.list({
    limit: limit,
    skip: skip
  }).then(function (categories) {
    return res.json({
      status: "success",
      result: categories
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error getting categories"
    });
  });
}; // const getMatchedTypes = (req, res, next, service) => {
//   ServiceType.getMatchedTypes(service)
//     .then(serviceTypes => {
//       req.serviceTypes = serviceTypes; // eslint-disable-line no-param-reassign
//       return next();
//     })
//     .catch(e => next(e));
// }
// const getMatchedFoundTypes = (req, res) => {
//   return res.status(200).json(req.serviceTypes);
// }


var updateCategoryPhoto = function updateCategoryPhoto(req, res, next) {
  singleUpload(req, res, function (err) {
    if (err) {
      return res.status(422).send({
        errors: [{
          title: 'Image Upload Error',
          detail: err.message
        }]
      });
    }

    _category.default.updateCategoryPhoto(req.category._id, req.file.location).then(function (updated) {
      res.json({
        status: "success",
        result: {
          image_url: updated.image_url
        }
      });
    }).catch(function (e) {
      return res.status(500).json({
        status: "error",
        message: "Error updating category photo"
      });
    });
  });
}; // const loadSubCategory = (req, res, next, subCategoryId) => {
//   ServiceType.getSubCategory(subCategoryId)
//     .then((serviceSubCategory) => {
//       req.serviceSubCategory = serviceSubCategory; // eslint-disable-line no-param-reassign
//       return next();
//     })
//     .catch(e => next(e));
// }
// const getSubCategory = (req, res) => {
//   return res.status(200).json(req.serviceSubCategory);
// }


var _default = {
  add: add,
  getCategory: getCategory,
  loadCategory: loadCategory,
  update: update,
  getAll: getAll,
  updateCategoryPhoto: updateCategoryPhoto
};
exports.default = _default;
//# sourceMappingURL=category.controller.js.map
