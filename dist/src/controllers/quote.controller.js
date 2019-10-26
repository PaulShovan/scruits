"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _underscore = _interopRequireDefault(require("underscore"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _order = _interopRequireDefault(require("../models/order.model"));

var _quote = _interopRequireDefault(require("../models/quote.model"));

var _partner = _interopRequireDefault(require("../models/partner.model"));

var _notification = _interopRequireDefault(require("../models/notification.model"));

var _constants = require("../helpers/constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var add = function add(req, res, next) {
  if (req.order.status == 4 && req.order.quotes.length > 0) {
    return res.status(200).json({
      status: "success",
      result: "Pending quote limit exceeds"
    });
  } else if (req.order.quotes.length >= 5) {
    _order.default.lockOrderForQuote(req.order._id).then(function (result) {
      return res.status(200).json({
        status: "success",
        result: "Pending quote limit exceeds"
      });
    });
  } else if (req.order.status == 4 && req.order.quotes.length == 0) {
    _order.default.unlockOrderForQuote(req.order._id).then(function (result) {
      var quote = new _quote.default({
        order_id: req.order._id,
        quote_partner: _mongoose.default.Types.ObjectId(req.authUser['custom:_id']),
        quote_explanation: req.body.quote_explanation,
        service_address: req.body.service_address,
        service_location: {
          type: 'Point',
          coordinates: [req.body.lon, req.body.lat]
        },
        price: req.body.price
      });
      quote.save().then(function (savedQuote) {
        console.log(req.authUser['custom:_id']);

        _order.default.addToQuoteList(req.order._id, savedQuote._id, req.authUser['custom:_id']).then(function (savedOrder) {
          _partner.default.addToQuoteList(req.authUser['custom:_id'], savedQuote._id).then(function (savedPartner) {
            var notification = new _notification.default({
              user_email: req.order.customer.email,
              notification_title: 'New Quote',
              notification_body: "You have a new quote from ".concat(savedPartner.first_name, " for ").concat(req.order.service.name),
              notification_data: {
                notification_type: _constants.notification_types.quote_received,
                payload: savedQuote._id
              }
            });
            notification.save();
            return res.status(200).json({
              status: "success",
              result: savedQuote
            });
          });
        });
      }).catch(function (e) {
        return res.status(500).json({
          status: "error",
          message: "Error adding quote"
        });
      });
    });
  } else {
    var quote = new _quote.default({
      order_id: req.order._id,
      quote_partner: _mongoose.default.Types.ObjectId(req.authUser['custom:_id']),
      quote_explanation: req.body.quote_explanation,
      service_address: req.body.service_address,
      service_location: {
        type: 'Point',
        coordinates: [req.body.lon, req.body.lat]
      },
      price: req.body.price
    });
    quote.save().then(function (savedQuote) {
      _order.default.addToQuoteList(req.order._id, savedQuote._id, req.authUser['custom:_id']).then(function (savedOrder) {
        _partner.default.addToQuoteList(req.authUser['custom:_id'], savedQuote._id).then(function (savedPartner) {
          var notification = new _notification.default({
            user_email: req.order.customer.email,
            notification_title: 'New Quote',
            notification_body: "You have a new quote from ".concat(savedPartner.first_name, " for ").concat(req.order.service.name),
            notification_data: {
              notification_type: _constants.notification_types.quote_received,
              payload: savedQuote._id
            }
          });
          notification.save();
          return res.status(200).json({
            status: "success",
            result: savedQuote
          });
        });
      });
    }).catch(function (e) {
      return res.status(500).json({
        status: "error",
        message: "Error adding quote"
      });
    });
  }
};
/**
 * update quote
 * @property {Object} req.body - Updated properties
 * @returns {Order}
 */


var update = function update(req, res, next) {
  var quote = req.quote;
  quote = _underscore.default.extend(quote, req.body);
  quote.save().then(function (savedQuote) {
    return res.status(200).json({
      status: "success",
      result: savedQuote
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error updating quote"
    });
  });
};
/**
 * Get quote
 * @returns {Quote}
 */


var getQuote = function getQuote(req, res) {
  return res.status(200).json({
    status: "success",
    result: req.quote
  });
};
/**
 * Get quote
 * @returns {Quote}
 */


var acceptQuote = function acceptQuote(req, res, next) {
  _quote.default.acceptQuote(req.quote._id).then(function (updatedQuote) {
    _order.default.updateAppointedPartner(updatedQuote.order_id, updatedQuote.quote_partner, updatedQuote.price).then(function (order) {
      _partner.default.addOrder(updatedQuote.quote_partner, updatedQuote.order_id).then(function (partner) {
        _order.default.getOrderFull(updatedQuote.order_id).then(function (orderFull) {
          var notification = new _notification.default({
            user_email: partner.email,
            notification_title: 'Quote accepted',
            notification_body: "Congrats! Your quote for ".concat(order.service.name, " has been accepted by ").concat(orderFull.customer.first_name, " ").concat(orderFull.customer.last_name),
            notification_data: {
              notification_type: _constants.notification_types.quote_accepted,
              payload: updatedQuote.order_id
            }
          });
          notification.save();
          return res.status(200).json({
            status: "success",
            result: updatedQuote
          });
        });
      });
    }).catch(function (e) {
      return res.status(500).json({
        status: "error",
        message: "Error accepting quote"
      });
    });
  }).catch(function (e) {
    return next(e);
  });
};

var rejectQuote = function rejectQuote(req, res) {
  _quote.default.rejectQuote(req.quote._id).then(function (updatedQuote) {
    _order.default.addToRejectedPartnerList(req.quote.order_id, req.quote.quote_partner, req.quote._id).then(function (rej) {
      return res.status(200).json({
        status: "success",
        result: updatedQuote
      });
    });
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error rejecting quote"
    });
  });
};
/**
 * Load order and append to req.
 */


var loadOrder = function loadOrder(req, res, next, order) {
  _order.default.getOrderFull(order).then(function (order) {
    req.order = order; // eslint-disable-line no-param-reassign

    return next();
  }).catch(function (e) {
    return next(e);
  });
};
/**
 * Load quote and append to req.
 */


var loadQuote = function loadQuote(req, res, next, quoteId) {
  _quote.default.get(quoteId).then(function (quote) {
    req.quote = quote; // eslint-disable-line no-param-reassign

    return next();
  }).catch(function (e) {
    return res.status(500).json({
      status: "error",
      message: "Error loading quote"
    });
  });
};

var _default = {
  add: add,
  loadOrder: loadOrder,
  loadQuote: loadQuote,
  update: update,
  getQuote: getQuote,
  acceptQuote: acceptQuote,
  rejectQuote: rejectQuote
};
exports.default = _default;
//# sourceMappingURL=quote.controller.js.map
