"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _auth = _interopRequireDefault(require("./auth.routes"));

var _partner = _interopRequireDefault(require("./partner.routes"));

var _customer = _interopRequireDefault(require("./customer.routes"));

var _service = _interopRequireDefault(require("./service.routes"));

var _order = _interopRequireDefault(require("./order.routes"));

var _admin = _interopRequireDefault(require("../routes/admin.routes"));

var _quote = _interopRequireDefault(require("../routes/quote.routes"));

var _category = _interopRequireDefault(require("../routes/category.routes"));

var _serviceItem = _interopRequireDefault(require("../routes/serviceItem.routes"));

var _chat = _interopRequireDefault(require("../routes/chat.routes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express.default.Router(); // eslint-disable-line new-cap


function routes() {
  /** GET /check - Check service health */
  router.get('/check', function (req, res) {
    return res.send('OK');
  }); // force do not cache for CloudFront

  router.use(function (req, res, next) {
    // inject default headers
    res.header('cache-control', 'private, max-age=0');
    next();
  }); // mount auth routes at /auth

  router.use('/auth', (0, _auth.default)()); // mount partner routes at /partner

  router.use('/partner', (0, _partner.default)()); // mount customer routes at /customer

  router.use('/customer', (0, _customer.default)()); // mount service routes at /service

  router.use('/service', (0, _service.default)()); // mount serviceitem routes at /serviceitem

  router.use('/serviceitem', (0, _serviceItem.default)()); // mount order routes at /order

  router.use('/order', (0, _order.default)()); // mount order routes at /category

  router.use('/category', (0, _category.default)()); // mount order routes at /quote

  router.use('/quote', (0, _quote.default)()); // mount admin routes at /admin

  router.use('/admin', (0, _admin.default)()); // mount chat routes at /

  router.use('/', (0, _chat.default)());
  return router;
}

var _default = routes;
exports.default = _default;
//# sourceMappingURL=index.routes.js.map
