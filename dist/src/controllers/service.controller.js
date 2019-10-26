"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _underscore = _interopRequireDefault(require("underscore"));

var _service = _interopRequireDefault(require("../models/service.model"));

var _s = require("../services/s3.service");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var singleUpload = _s.upload.single('image');

var add = function add(req, res, next) {
  var service = new _service.default({
    category: req.body.categoryId,
    name: req.body.name,
    status: req.authUser['custom:role'] === 'admin' ? 1 : 2,
    description: req.body.description
  });
  service.save().then(function (savedService) {
    return res.status(200).json({
      status: "success",
      result: savedService
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error adding service"
    });
  });
};

var updateServicePhoto = function updateServicePhoto(req, res, next) {
  singleUpload(req, res, function (err) {
    if (err) {
      return res.status(422).send({
        status: "error",
        message: 'Image Upload Error'
      });
    }

    _service.default.updateServicePhoto(req.service._id, req.file.location).then(function (updated) {
      res.status(200).json({
        status: "success",
        result: {
          image_url: updated.image_url
        }
      });
    }).catch(function (e) {
      return res.status(500).json({
        status: "error",
        message: "Error updating service photo"
      });
    });
  });
};

var getServices = function getServices(req, res, next) {
  var _req$query = req.query,
      _req$query$limit = _req$query.limit,
      limit = _req$query$limit === void 0 ? 50 : _req$query$limit,
      _req$query$skip = _req$query.skip,
      skip = _req$query$skip === void 0 ? 0 : _req$query$skip,
      _req$query$status = _req$query.status,
      status = _req$query$status === void 0 ? 1 : _req$query$status;

  _service.default.getServices({
    limit: limit,
    skip: skip,
    status: status
  }).then(function (services) {
    return res.json({
      status: "success",
      result: services
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error getting services"
    });
  });
};

var getMatchedServices = function getMatchedServices(req, res, next) {
  var _req$query2 = req.query,
      _req$query2$limit = _req$query2.limit,
      limit = _req$query2$limit === void 0 ? 50 : _req$query2$limit,
      _req$query2$skip = _req$query2.skip,
      skip = _req$query2$skip === void 0 ? 0 : _req$query2$skip,
      _req$query2$text = _req$query2.text,
      text = _req$query2$text === void 0 ? '' : _req$query2$text;

  _service.default.getMatchedServices(limit, skip, text).then(function (services) {
    if (req.authUser['custom:role'] !== 'admin') {
      services = services.filter(function (s) {
        return s.status === 1;
      });
    }

    return res.json({
      status: "success",
      result: services
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      // message:"Error getting services"
      message: e
    });
  });
};

var loadServiceByCategory = function loadServiceByCategory(req, res, next, categoryId) {
  _service.default.getServicesByCategory(categoryId).then(function (services) {
    req.services = services; // eslint-disable-line no-param-reassign

    return next();
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error loading service"
    });
  });
};

var getServiceByCategory = function getServiceByCategory(req, res) {
  var services = req.services;

  if (req.query.status) {
    services = req.services.filter(function (s) {
      return s.status == req.query.status;
    });
  }

  return res.json({
    status: "success",
    result: services
  });
};
/**
 * update service
 * @property {Object} req.body - Updated properties
 * @returns {Service}
 */


var update = function update(req, res, next) {
  var service = req.service;
  service = _underscore.default.extend(service, req.body);
  service.save().then(function (savedservice) {
    return res.json({
      status: "success",
      result: savedservice
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error updating service"
    });
  });
};
/**
 * Get service
 * @returns {Service}
 */


var getService = function getService(req, res) {
  return res.json({
    status: "success",
    result: req.service
  });
};
/**
 * Load service and append to req.
 */


var load = function load(req, res, next, serviceId) {
  _service.default.get(serviceId).then(function (service) {
    req.service = service; // eslint-disable-line no-param-reassign

    return next();
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error loading service"
    });
  });
};

var _default = {
  add: add,
  load: load,
  getService: getService,
  update: update,
  getServices: getServices,
  updateServicePhoto: updateServicePhoto,
  loadServiceByCategory: loadServiceByCategory,
  getServiceByCategory: getServiceByCategory,
  getMatchedServices: getMatchedServices
};
exports.default = _default;
//# sourceMappingURL=service.controller.js.map
