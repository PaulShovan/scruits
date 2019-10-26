"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _order = _interopRequireDefault(require("../controllers/order.controller"));

var _customer = _interopRequireDefault(require("../controllers/customer.controller"));

var _partner = _interopRequireDefault(require("../controllers/partner.controller"));

var _admin = _interopRequireDefault(require("../controllers/admin.controller"));

var _cognitoexpress = _interopRequireDefault(require("../configurations/cognitoexpress.configuration"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express.default.Router();

function adminRoutes() {
  router.use(function (req, res, next) {
    //I'm passing in the access token in header under key accessToken
    var accessTokenFromClient = req.headers.accesstoken; //Fail if token not present in header. 

    if (!accessTokenFromClient) return res.status(401).send({
      status: "error",
      message: "Access Token missing from header"
    });

    _cognitoexpress.default.validate(accessTokenFromClient, function (err, response) {
      //If API is not authenticated, Return 401 with error message. 
      if (err) {
        return res.status(401).send({
          status: "error",
          message: err
        });
      } else if (response['custom:role'] != 'admin') {
        return res.status(401).send({
          status: "error",
          message: "Only admin is allowed!"
        });
      } //Else API has been authenticated. Proceed.


      req.authUser = response;
      console.log(req.authUser);
      next();
    });
  });
  router.route('/count')
  /** GET /api/admin/count/- Get count of order, partner, customer */
  .get(_admin.default.totalOrderPartnerCustomer);
  router.route('/add')
  /** GET /api/admin/add/- Get count of order, partner, customer */
  .post(_admin.default.addAdmin);
  router.route('/order')
  /** GET /api/admin/order/- Get order list */
  .get(_order.default.get);
  router.route('/order/:orderId')
  /** GET /api/admin/order/:orderId - Get order */
  .get(_order.default.getOrder)
  /** PUT /api/order/:orderId - Update order */
  .put(_order.default.update);
  router.route('/customer')
  /** GET /api/admin/customer/- Get customer list */
  .get(_customer.default.get);
  router.route('/customer/:customerId')
  /** GET /api/admin/customer/:customerId - Get customer */
  .get(_customer.default.getCustomer)
  /** PUT /api/admin/customer/:orderId - Update order */
  .put(_customer.default.update);
  router.route('/customer/:customerId/orders')
  /** GET /api/admin/customer/:customerId - Get customer */
  .get(_customer.default.getOrders);
  router.route('/partner')
  /** GET /api/admin/partner/- Get partner list */
  .get(_partner.default.get);
  router.route('/partner/:partnerId')
  /** GET /api/admin/partner/:partnerId - Get partner */
  .get(_partner.default.getPartner)
  /** PUT /api/admin/partner/:partnerId - Update partner */
  .put(_partner.default.update);
  /** Load partner when API with partnerId route parameter is hit **/

  router.param('partnerId', _partner.default.load);
  /** Load order when API with orderId route parameter is hit **/

  router.param('orderId', _order.default.loadOrder);
  /** Load customer when API with customerId route parameter is hit **/

  router.param('customerId', _customer.default.loadCustomer);
  return router;
}

var _default = adminRoutes;
exports.default = _default;
//# sourceMappingURL=admin.routes.js.map
