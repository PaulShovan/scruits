"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _underscore = _interopRequireDefault(require("underscore"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _order = _interopRequireDefault(require("../models/order.model"));

var _customer = _interopRequireDefault(require("../models/customer.model"));

var _serviceItem = _interopRequireDefault(require("../models/serviceItem.model"));

var _partner = _interopRequireDefault(require("../models/partner.model"));

var _notification = _interopRequireDefault(require("../models/notification.model"));

var _constants = require("../helpers/constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var add = function add(req, res, next) {
  var order = new _order.default({
    order_schedule_date: new Date(req.body.order_schedule_date),
    service: req.body.service,
    request_budget: req.body.request_budget,
    time_range: req.body.time_range,
    payment_details: req.body.payment_details,
    customer: _mongoose.default.Types.ObjectId(req.authUser['custom:_id'])
  });
  order.save().then(function (savedOrder) {
    _customer.default.addToOrderList(req.authUser['custom:_id'], savedOrder._id).then(function (savedCustomer) {
      res.status(200).json({
        status: "success",
        result: savedOrder
      });
    }).catch(function (e) {
      return res.status(500).json({
        status: "error",
        message: "Error adding order"
      });
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error adding order"
    });
  });
};

var addReview = function addReview(req, res, next) {
  var review = {
    reviewed_by: req.authUser['custom:_id'],
    order: req.order._id,
    star: parseFloat(req.body.star),
    description: req.body.description
  };

  _partner.default.addReview(req.order.appointed_partner, review).then(function (response) {
    return res.status(200).json({
      status: "success",
      result: review
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error adding review"
    });
  });
};

var get = function get(req, res, next) {
  var _req$query = req.query,
      _req$query$limit = _req$query.limit,
      limit = _req$query$limit === void 0 ? 50 : _req$query$limit,
      _req$query$skip = _req$query.skip,
      skip = _req$query$skip === void 0 ? 0 : _req$query$skip,
      _req$query$status = _req$query.status,
      status = _req$query$status === void 0 ? 1 : _req$query$status;

  _order.default.list({
    limit: limit,
    skip: skip,
    status: status
  }).then(function (orders) {
    return res.status(200).json({
      status: "success",
      result: orders
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error getting order"
    });
  });
};
/**
 * update order
 * @property {Object} req.body - Updated properties
 * @returns {Order}
 */


var update = function update(req, res, next) {
  var order = req.order;
  order = _underscore.default.extend(order, req.body);
  order.save().then(function (savedOrder) {
    return res.status(200).json({
      status: "success",
      result: savedOrder
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error updating order"
    });
  });
};

var updatePayment = function updatePayment(req, res, next) {
  var payment = req.order.payment_details || {};
  payment.transaction_id = req.body.transaction_id;
  payment.amount = req.body.amount;
  payment.currency = req.body.currency || "CAD";
  payment.payment_type = req.body.payment_type;
  payment.status = 2;

  _order.default.updatePayment(req.order._id, payment).then(function (savedOrder) {
    _partner.default.updateTotalEarned(req.order.appointed_partner, parseFloat(payment.amount)).then(function (partner) {
      _customer.default.updateNumOfOrders(req.order.customer._id).then(function (customer) {
        return res.status(200).json({
          status: "success",
          result: savedOrder.payment_details
        });
      });
    }).catch(function (e) {
      return res.status(500).json({
        status: "error",
        message: "Error updating payment"
      });
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error updating payment"
    });
  });
};
/**
 * Get order
 * @returns {Order}
 */


var getOrder = function getOrder(req, res) {
  return res.status(200).json(req.order);
};
/**
 * Load order and append to req.
 */


var loadOrder = function loadOrder(req, res, next, order) {
  _order.default.getOrderFull(order).then(function (order) {
    req.order = order; // eslint-disable-line no-param-reassign

    return next();
  }).catch(function (e) {
    console.log(e);
    return res.status(500).json({
      status: "error",
      message: "Error loading order"
    });
  });
};

var getAvailablePartners = function getAvailablePartners(req, res, next) {
  _serviceItem.default.find({
    $and: [{
      loc: {
        $near: {
          $maxDistance: 1000 * req.order.customer.service_search_radius,
          $geometry: {
            type: "Point",
            coordinates: req.order.customer.loc.coordinates
          }
        }
      }
    }, // { service: req.order.service.id }, { price: { $lte: req.order.request_budget.max} }]}, 'partner')
    {
      service: req.order.service.id
    }]
  }, 'partner').populate({
    path: 'partner',
    select: 'email'
  }).exec(function (error, results) {
    if (error) {
      console.log(error);
      return res.status(500).json({
        status: "error",
        message: "Error getting available partners"
      });
    }

    if (results.length > 0) {
      results = results.filter(function (re) {
        return !req.order.partners_quoted.map(function (q) {
          return q.toString();
        }).includes(re.partner._id.toString());
      });
      var partners = results.map(function (p) {
        return p.partner ? p.partner._id : 0;
      });
      var notifications = results.map(function (r) {
        return {
          user_email: r.partner.email,
          notification_title: 'New lead',
          notification_body: "You have a new lead for ".concat(req.order.service.name),
          notification_data: {
            notification_type: _constants.notification_types.new_lead,
            payload: req.order._id
          }
        };
      });

      _notification.default.insertMany(notifications);

      _order.default.addToPartnerToQuoteList(req.order._id, partners).then(function (resp) {
        return res.status(200).json({
          status: "success",
          result: results
        });
      }).catch(function (e) {
        return res.status(500).json({
          status: "error",
          message: e
        });
      });
    } else {
      return res.status(200).json({
        status: "success",
        result: []
      });
    } // TODO Send notification to partners with order id for quotes

  });
};

var rejectOrderForPartner = function rejectOrderForPartner(req, res) {
  _order.default.removeFromPartnerToQuoteList(req.order._id, req.authUser['custom:_id']).then(function (order) {
    return res.status(200).json({
      status: "success",
      result: 'Order rejected successfully'
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error rejecting order"
    });
  });
};

var getQuotes = function getQuotes(req, res, next) {
  _order.default.getQuotes(req.query.orderid).then(function (quotes) {
    return res.status(200).json({
      status: "success",
      result: quotes
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error getting quotes"
    });
  });
};

var _default = {
  add: add,
  get: get,
  getOrder: getOrder,
  update: update,
  getAvailablePartners: getAvailablePartners,
  loadOrder: loadOrder,
  getQuotes: getQuotes,
  addReview: addReview,
  updatePayment: updatePayment,
  rejectOrderForPartner: rejectOrderForPartner
};
exports.default = _default;
//# sourceMappingURL=order.controller.js.map
