"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _underscore = _interopRequireDefault(require("underscore"));

var _serviceItem = _interopRequireDefault(require("../models/serviceItem.model"));

var _partner = _interopRequireDefault(require("../models/partner.model"));

var _s = require("../services/s3.service");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var singleUpload = _s.upload.single('image');

var add = function add(req, res, next) {
  _partner.default.getById(req.authUser['custom:_id']).then(function (partner) {
    var serviceItem = new _serviceItem.default({
      service: req.body.serviceId,
      partner: req.authUser['custom:_id'],
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      loc: partner.loc
    });
    serviceItem.save().then(function (savedServiceItem) {
      return res.json({
        status: "success",
        result: {
          status: savedServiceItem.status,
          _id: savedServiceItem._id,
          service: savedServiceItem.service,
          partner: savedServiceItem.partner,
          name: savedServiceItem.name,
          price: savedServiceItem.price,
          description: savedServiceItem.description
        }
      });
    }).catch(function (e) {
      return res.status(500).json({
        status: "error",
        message: "Error adding service item"
      });
    });
  });
};

var updateServiceItemPhoto = function updateServiceItemPhoto(req, res, next) {
  singleUpload(req, res, function (err) {
    if (err) {
      return res.status(422).send({
        errors: [{
          title: 'Image Upload Error',
          detail: err.message
        }]
      });
    }

    _serviceItem.default.updateServiceItemPhoto(req.serviceItem._id, req.file.location).then(function (updated) {
      res.json({
        status: "success",
        result: {
          image_url: updated.image_url
        }
      });
    }).catch(function (e) {
      return res.status(500).json({
        status: "error",
        message: "Error updating service item photo"
      });
    });
  });
};

var getServiceItems = function getServiceItems(req, res, next) {
  var _req$query = req.query,
      _req$query$limit = _req$query.limit,
      limit = _req$query$limit === void 0 ? 50 : _req$query$limit,
      _req$query$skip = _req$query.skip,
      skip = _req$query$skip === void 0 ? 0 : _req$query$skip,
      _req$query$status = _req$query.status,
      status = _req$query$status === void 0 ? 1 : _req$query$status;

  _serviceItem.default.getServiceItems({
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
      message: "Error getting service items"
    });
  });
};

var loadServiceItemsByServiceId = function loadServiceItemsByServiceId(req, res, next, serviceId) {
  _serviceItem.default.getServiceItemsByService(serviceId).then(function (services) {
    req.serviceId = serviceId;
    req.serviceItems = services; // eslint-disable-line no-param-reassign

    return next();
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error getting service items"
    });
  });
};

var loadServiceItemsByPartnerId = function loadServiceItemsByPartnerId(req, res, next, partnerId) {
  _serviceItem.default.getServiceItemsByPartner(partnerId).then(function (services) {
    req.serviceItems = services; // eslint-disable-line no-param-reassign

    return next();
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error getting service items"
    });
  });
};

var getServiceItemsByServiceId = function getServiceItemsByServiceId(req, res) {
  return res.status(200).json({
    status: "success",
    result: req.serviceItems
  });
};

var getServiceItemsByPartnerId = function getServiceItemsByPartnerId(req, res) {
  return res.status(200).json({
    status: "success",
    result: req.serviceItems
  });
};

var getServiceItemsById = function getServiceItemsById(req, res) {
  return res.status(200).json({
    status: "success",
    result: req.serviceItem
  });
};
/**
 * update service
 * @property {Object} req.body - Updated properties
 * @returns {Service}
 */


var update = function update(req, res, next) {
  var serviceItem = req.serviceItem;
  serviceItem = _underscore.default.extend(serviceItem, req.body);
  serviceItem.save().then(function (savedservice) {
    return res.json({
      status: "success",
      result: savedservice
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error updating service item"
    });
  });
};

var deleteServiceItem = function deleteServiceItem(req, res, next) {
  _serviceItem.default.removeServiceItemById(req.serviceItem._id).then(function (result) {
    return res.json({
      status: "success",
      result: 'Item has been removed'
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error removing service items"
    });
  });
};

var removeServiceItemByServiceAndPartnerId = function removeServiceItemByServiceAndPartnerId(req, res) {
  _serviceItem.default.removeServiceItemByServiceAndPartnerId(req.serviceId, req.authUser['custom:_id']).then(function (result) {
    _partner.default.removeAssociatedService(req.authUser['custom:_id'], req.serviceId).then(function (partner) {
      return res.json({
        status: "success",
        result: 'Items has been removed'
      });
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error removing service items"
    });
  });
};
/**
 * Load service and append to req.
 */


var load = function load(req, res, next, serviceId) {
  _serviceItem.default.get(serviceId).then(function (serviceItem) {
    req.serviceItem = serviceItem; // eslint-disable-line no-param-reassign

    return next();
  }).catch(function (e) {
    return next(e);
  });
};

var _default = {
  add: add,
  load: load,
  update: update,
  getServiceItems: getServiceItems,
  updateServiceItemPhoto: updateServiceItemPhoto,
  loadServiceItemsByPartnerId: loadServiceItemsByPartnerId,
  loadServiceItemsByServiceId: loadServiceItemsByServiceId,
  getServiceItemsByPartnerId: getServiceItemsByPartnerId,
  getServiceItemsByServiceId: getServiceItemsByServiceId,
  getServiceItemsById: getServiceItemsById,
  deleteServiceItem: deleteServiceItem,
  removeServiceItemByServiceAndPartnerId: removeServiceItemByServiceAndPartnerId
};
exports.default = _default;
//# sourceMappingURL=serviceItem.controller.js.map
