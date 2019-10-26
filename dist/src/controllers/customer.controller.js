"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _underscore = _interopRequireDefault(require("underscore"));

var _customer = _interopRequireDefault(require("../models/customer.model"));

var _service = _interopRequireDefault(require("../models/service.model"));

var _serviceItem = _interopRequireDefault(require("../models/serviceItem.model"));

var _constants = require("../helpers/constants");

var _auth = _interopRequireDefault(require("../controllers/auth.controller"));

var _s = require("../services/s3.service");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var singleUpload = _s.upload.single('image');

var add = function add(req, res, next) {
  _customer.default.getByEmailOrPhone(req.body.email, req.body.phone).then(function (result) {
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

    var customer = new _customer.default({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      address: req.body.address,
      loc: {
        type: 'Point',
        coordinates: [req.body.lon, req.body.lat]
      },
      phone: req.body.phone,
      role: _constants.roles.customer
    });
    customer.save().then(function (savedCustomer) {
      _auth.default.register({
        email: savedCustomer.email,
        password: req.body.password,
        user_id: savedCustomer.customer_id,
        _id: savedCustomer._id
      }, _constants.roles.customer).then(function (result) {
        return res.status(200).json({
          status: "success",
          result: result
        });
      }).catch(function (e) {
        return res.status(500).json({
          status: "error",
          message: "Error adding customer"
        });
      });
    }).catch(function (e) {
      return res.status(500).json({
        status: "error",
        message: "Error adding customer"
      });
    });
  });
};
/**
 * update customer
 * @property {Object} req.body - Updated properties
 * @returns {Order}
 */


var update = function update(req, res, next) {
  var customer = req.customer;

  if (req.body.lat && req.body.lon) {
    customer.loc = {
      type: 'Point',
      coordinates: [req.body.lon, req.body.lat]
    };
  }

  customer = _underscore.default.extend(customer, req.body);
  customer.save().then(function (savedCustomer) {
    return res.status(200).json({
      status: "success",
      result: savedCustomer
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error updating customer"
    });
  });
};
/**
 * update customer using token
 * @property {Object} req.body - Updated properties
 * @returns {Service}
 */


var updateCustomer = function updateCustomer(req, res, next) {
  _customer.default.get(req.authUser['custom:_id']).then(function (customer) {
    if (req.body.lat && req.body.lon) {
      customer.loc = {
        type: 'Point',
        coordinates: [req.body.lon, req.body.lat]
      };
    }

    customer = _underscore.default.extend(customer, req.body);
    customer.save().then(function (result) {
      return res.status(200).json({
        status: "success",
        result: result
      });
    }).catch(function (e) {
      return res.status(500).json({
        status: "error",
        message: "Error updating customer"
      });
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error updating customer"
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

    _customer.default.updatePhoto(req.authUser['custom:_id'], req.file.location).then(function (updatedCustomer) {
      res.json({
        status: "success",
        result: {
          profile_photo: updatedCustomer.profile_photo
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

var getNearbyPartners = function getNearbyPartners(req, res, next) {
  var _req$query = req.query,
      _req$query$limit = _req$query.limit,
      limit = _req$query$limit === void 0 ? 50 : _req$query$limit,
      _req$query$skip = _req$query.skip,
      skip = _req$query$skip === void 0 ? 0 : _req$query$skip;

  _customer.default.getById(req.authUser['custom:_id']).then(function (customer) {
    _serviceItem.default.find({
      loc: {
        $near: {
          $maxDistance: 1000 * customer.service_search_radius,
          $geometry: {
            type: "Point",
            coordinates: customer.loc.coordinates
          }
        }
      }
    }, 'partner').skip(+skip).limit(+limit).populate({
      path: 'partner',
      select: 'first_name last_name email phone address images'
    }).exec(function (error, results) {
      if (error) {
        console.log(error);
        return res.status(500).json({
          status: "error",
          message: error
        });
      } // TODO Send notification to partners with order id for quotes


      return res.status(200).json({
        status: "success",
        result: results
      });
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error getting nearby partners"
    });
  });
};

var get = function get(req, res, next) {
  var _req$query2 = req.query,
      _req$query2$limit = _req$query2.limit,
      limit = _req$query2$limit === void 0 ? 50 : _req$query2$limit,
      _req$query2$skip = _req$query2.skip,
      skip = _req$query2$skip === void 0 ? 0 : _req$query2$skip;

  _customer.default.list({
    limit: limit,
    skip: skip
  }).then(function (customers) {
    return res.json({
      status: "success",
      result: customers
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error getting customers"
    });
  });
};
/**
 * Get customer
 * @returns {Customer}
 */


var getCustomer = function getCustomer(req, res) {
  return res.status(200).json({
    status: "success",
    result: req.customer
  });
};
/**
 * Load customer and append to req.
 */


var loadCustomer = function loadCustomer(req, res, next, customerId) {
  _customer.default.get(customerId).then(function (order) {
    req.customer = order; // eslint-disable-line no-param-reassign

    return next();
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: e
    });
  });
};

var profile = function profile(req, res, next) {
  _customer.default.getById(req.authUser['custom:_id']).then(function (profile) {
    return res.status(200).json({
      status: "success",
      result: profile
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error loading profile"
    });
  });
};

var orders = function orders(req, res, next) {
  _customer.default.getOrders(req.authUser['custom:_id']).then(function (orders) {
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

var getOrders = function getOrders(req, res, next) {
  _customer.default.getOrders(req.customer._id).then(function (orders) {
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

var _default = {
  add: add,
  get: get,
  loadCustomer: loadCustomer,
  getCustomer: getCustomer,
  update: update,
  profile: profile,
  orders: orders,
  updateProfilePhoto: updateProfilePhoto,
  getNearbyPartners: getNearbyPartners,
  getOrders: getOrders,
  updateCustomer: updateCustomer
};
exports.default = _default;
//# sourceMappingURL=customer.controller.js.map
