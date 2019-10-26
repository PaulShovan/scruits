"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _underscore = _interopRequireDefault(require("underscore"));

var _partner = _interopRequireDefault(require("../models/partner.model"));

var _service = _interopRequireDefault(require("../models/service.model"));

var _serviceItem = _interopRequireDefault(require("../models/serviceItem.model"));

var _order = _interopRequireDefault(require("../models/order.model"));

var _constants = require("../helpers/constants");

var _auth = _interopRequireDefault(require("../controllers/auth.controller"));

var _s = require("../services/s3.service");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var multipleUpload = _s.upload.array('images');

var singleUpload = _s.upload.single('image');

var add = function add(req, res, next) {
  _partner.default.getByEmailOrPhone(req.body.email, req.body.phone).then(function (result) {
    if (result) {
      if (result.phone === req.body.phone) {
        return res.status(400).json({
          message: 'Phone number already exists.'
        });
      } else {
        return res.status(400).json({
          message: 'Email already exists.'
        });
      }
    }

    var partner = new _partner.default({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      address: req.body.address,
      loc: {
        type: 'Point',
        coordinates: [req.body.lon, req.body.lat]
      },
      phone: req.body.phone,
      role: _constants.roles.partner,
      business_hours: req.body.business_hours,
      can_goto_customer_location: req.body.can_goto_customer_location,
      bio: req.body.bio
    });
    partner.save().then(function (savedPartner) {
      _auth.default.register({
        email: savedPartner.email,
        password: req.body.password,
        user_id: savedPartner.partner_id,
        _id: savedPartner._id
      }, _constants.roles.partner).then(function (result) {
        return res.status(200).json({
          status: "success",
          result: result
        });
      }).catch(function (e) {
        return res.status(500).json({
          status: "error",
          message: "Error adding partner"
        });
      });
    }).catch(function (e) {
      return res.status(500).json({
        status: "error",
        message: "Error adding partner"
      });
    });
  });
};

var get = function get(req, res, next) {
  var _req$query = req.query,
      _req$query$limit = _req$query.limit,
      limit = _req$query$limit === void 0 ? 50 : _req$query$limit,
      _req$query$skip = _req$query.skip,
      skip = _req$query$skip === void 0 ? 0 : _req$query$skip;

  _partner.default.list({
    limit: limit,
    skip: skip
  }).then(function (partners) {
    return res.status(200).json({
      status: "success",
      result: partners
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error getting partners"
    });
  });
};
/**
 * update partner
 * @property {Object} req.body - Updated properties
 * @returns {Service}
 */


var update = function update(req, res, next) {
  var partner = req.partner;
  var updateLoc = false;

  if (req.body.lat && req.body.lon) {
    partner.loc = {
      type: 'Point',
      coordinates: [req.body.lon, req.body.lat]
    };
    updateLoc = true;
  }

  partner = _underscore.default.extend(partner, req.body);
  partner.save().then(function (result) {
    if (updateLoc) {
      _serviceItem.default.updateLocationOfServiceItem(result._id, partner.loc).then(function (updatedLoc) {
        console.log(updatedLoc);
        return res.status(200).json({
          status: "success",
          result: result
        });
      });
    } else {
      return res.status(200).json({
        status: "success",
        result: result
      });
    }
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error updating partner"
    });
  });
};
/**
 * update partner using token
 * @property {Object} req.body - Updated properties
 * @returns {Service}
 */


var updatePartner = function updatePartner(req, res, next) {
  _partner.default.get(req.authUser['custom:_id']).then(function (partner) {
    var updateLoc = false;

    if (req.body.lat && req.body.lon) {
      partner.loc = {
        type: 'Point',
        coordinates: [req.body.lon, req.body.lat]
      };
      updateLoc = true;
    }

    partner = _underscore.default.extend(partner, req.body);
    partner.save().then(function (result) {
      if (updateLoc) {
        _serviceItem.default.updateLocationOfServiceItem(result._id, partner.loc).then(function (updatedLoc) {
          console.log(updatedLoc);
          return res.status(200).json({
            status: "success",
            result: result
          });
        });
      } else {
        return res.status(200).json({
          status: "success",
          result: result
        });
      }
    }).catch(function (e) {
      return res.status(500).json({
        status: "error",
        message: "Error updating partner"
      });
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error updating partner"
    });
  });
};
/**
 * Get partner
 * @returns {Partner}
 */


var getPartner = function getPartner(req, res) {
  return res.status(200).json({
    status: "success",
    result: req.partner
  });
};
/**
 * Load partner and append to req.
 */


var load = function load(req, res, next, partnerId) {
  _partner.default.get(partnerId).then(function (partner) {
    req.partner = partner; // eslint-disable-line no-param-reassign

    return next();
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error loading partner"
    });
  });
};

var profile = function profile(req, res, next) {
  _partner.default.getById(req.authUser['custom:_id']).then(function (partner) {
    return res.status(200).json({
      status: "success",
      result: partner
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error loading profile"
    });
  });
};

var reviews = function reviews(req, res, next) {
  _partner.default.getReviews(req.authUser['custom:_id']).then(function (partner) {
    return res.status(200).json({
      status: "success",
      result: partner
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error loading profile"
    });
  });
};

var getServices = function getServices(req, res, next) {
  _partner.default.getAssociatedServices(req.authUser['custom:_id']).then(function (services) {
    return res.status(200).json({
      status: "success",
      result: services.accociated_services
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error getting services"
    });
  });
};

var getServiceItems = function getServiceItems(req, res, next) {
  _serviceItem.default.getPartnerServiceItemsByServiceId(req.authUser['custom:_id'], req.query.service).then(function (services) {
    return res.status(200).json({
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

var uploadPhotos = function uploadPhotos(req, res, next) {
  multipleUpload(req, res, function (err) {
    if (err) {
      return res.status(422).send({
        status: "error",
        message: 'Image Upload Error'
      });
    }

    var photos = req.files.map(function (f) {
      return f.location;
    });

    _partner.default.updatePhoto(req.authUser['custom:_id'], photos).then(function (updatedPartner) {
      res.status(200).json({
        status: "success",
        result: {
          images: updatedPartner
        }
      });
    }).catch(function (e) {
      return res.status(500).json({
        status: "error",
        message: "Error uploading photo"
      });
    });
  });
};

var updateProfilePhoto = function updateProfilePhoto(req, res, next) {
  singleUpload(req, res, function (err) {
    if (err) {
      return res.status(422).send({
        status: "error",
        message: 'Image Upload Error'
      });
    }

    _partner.default.updateProfilePhoto(req.authUser['custom:_id'], req.file.location).then(function (updatedPartner) {
      res.json({
        status: "success",
        result: {
          profile_photo: updatedPartner.profile_photo
        }
      });
    }).catch(function (e) {
      return res.status(500).json({
        status: "error",
        message: "Error updating photo"
      });
    });
  });
};

var orders = function orders(req, res, next) {
  _partner.default.getPartnerOrders(req.authUser['custom:_id']).then(function (orders) {
    return res.status(200).json({
      status: "success",
      result: orders
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error getting orders"
    });
  });
};

var getOrdersForPartnerToQuote = function getOrdersForPartnerToQuote(req, res, next) {
  var _req$query2 = req.query,
      _req$query2$limit = _req$query2.limit,
      limit = _req$query2$limit === void 0 ? 50 : _req$query2$limit,
      _req$query2$skip = _req$query2.skip,
      skip = _req$query2$skip === void 0 ? 0 : _req$query2$skip;

  _order.default.getOrdersForPartnerToQuote(skip, limit, req.authUser['custom:_id']).then(function (orders) {
    return res.status(200).json({
      status: "success",
      result: orders
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error getting orders"
    });
  });
};

var getOngoingOrders = function getOngoingOrders(req, res, next) {
  var _req$query3 = req.query,
      _req$query3$limit = _req$query3.limit,
      limit = _req$query3$limit === void 0 ? 50 : _req$query3$limit,
      _req$query3$skip = _req$query3.skip,
      skip = _req$query3$skip === void 0 ? 0 : _req$query3$skip;

  _order.default.getOngoingOrders(skip, limit, req.authUser['custom:_id']).then(function (orders) {
    var filteredOrder = orders.filter(function (item) {
      if (item.quotes.find(function (q) {
        return q.quote_partner == req.authUser['custom:_id'];
      })) {
        return true;
      }

      return false;
    });
    return res.status(200).json({
      status: "success",
      result: filteredOrder
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error getting orders"
    });
  });
};

var associateServices = function associateServices(req, res, next) {
  _partner.default.associateServices(req.authUser['custom:_id'], req.body.services).then(function (partner) {
    return res.status(200).json({
      status: "success",
      result: 'Services accociated successfully.'
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error getting orders"
    });
  });
};

var _default = {
  add: add,
  get: get,
  load: load,
  getPartner: getPartner,
  update: update,
  profile: profile,
  getServices: getServices,
  uploadPhotos: uploadPhotos,
  orders: orders,
  reviews: reviews,
  updatePartner: updatePartner,
  getOrdersForPartnerToQuote: getOrdersForPartnerToQuote,
  updateProfilePhoto: updateProfilePhoto,
  getServiceItems: getServiceItems,
  getOngoingOrders: getOngoingOrders,
  associateServices: associateServices
};
exports.default = _default;
//# sourceMappingURL=partner.controller.js.map
