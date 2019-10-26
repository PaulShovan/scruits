"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _customer = _interopRequireDefault(require("../models/customer.model"));

var _order = _interopRequireDefault(require("../models/order.model"));

var _partner = _interopRequireDefault(require("../models/partner.model"));

var _admin = _interopRequireDefault(require("../models/admin.model"));

var _constants = _interopRequireDefault(require("../helpers/constants"));

var _auth = _interopRequireDefault(require("../controllers/auth.controller"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var totalOrderPartnerCustomer = function totalOrderPartnerCustomer(req, res, next) {
  _customer.default.count({}).then(function (customerCount) {
    _order.default.count({}).then(function (orderCount) {
      _partner.default.count({}).then(function (partnerCount) {
        res.status(200).json({
          status: "success",
          result: {
            customerCount: customerCount,
            orderCount: orderCount,
            partnerCount: partnerCount
          }
        });
      }).catch(function (e) {
        return res.status(500).json({
          status: "error",
          message: "Error getting counts"
        });
      });
    }).catch(function (e) {
      return res.status(500).json({
        status: "error",
        message: "Error getting counts"
      });
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error getting counts"
    });
  });
};

var addAdmin = function addAdmin(req, res, next) {
  var admin = new _admin.default({
    name: req.body.name,
    email: req.body.email,
    address: req.body.address,
    phone: req.body.phone,
    role: _constants.default.admin
  });
  admin.save().then(function (savedCustomer) {
    _auth.default.register({
      email: savedCustomer.email,
      password: req.body.password,
      user_id: savedCustomer.admin_id,
      _id: savedCustomer._id
    }, _constants.default.admin).then(function (result) {
      return res.status(200).json({
        status: "success",
        result: result
      });
    }).catch(function (e) {
      return res.status(500).json({
        status: "error",
        message: "Error adding new admin"
      });
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error adding new admin"
    });
  });
};

var _default = {
  totalOrderPartnerCustomer: totalOrderPartnerCustomer,
  addAdmin: addAdmin
};
exports.default = _default;
//# sourceMappingURL=admin.controller.js.map
