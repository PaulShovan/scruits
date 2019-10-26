"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _order = _interopRequireDefault(require("../controllers/order.controller"));

var _cognitoexpress = _interopRequireDefault(require("../configurations/cognitoexpress.configuration"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express.default.Router();

function orderRoutes() {
  router.use(function (req, res, next) {
    //I'm passing in the access token in header under key accessToken
    var accessTokenFromClient = req.headers.accesstoken; //Fail if token not present in header. 

    if (!accessTokenFromClient) return res.status(401).send({
      status: "error",
      message: "Access Token missing from header"
    });

    _cognitoexpress.default.validate(accessTokenFromClient, function (err, response) {
      //If API is not authenticated, Return 401 with error message. 
      if (err) return res.status(401).send({
        status: "error",
        message: err
      }); //Else API has been authenticated. Proceed.

      req.authUser = response;
      console.log(req.authUser);
      next();
    });
  });
  router.route('/')
  /** GET /api/order/- Get order list */
  .get(_order.default.get)
  /** GET /api/order/- Add new order */
  .post(_order.default.add);
  router.route('/:orderId')
  /** GET /api/order/:orderId - Get order */
  .get(_order.default.getOrder)
  /** PUT /api/order/:orderId - Update order */
  .put(_order.default.update);
  router.route('/:orderId/addreview')
  /** POST /api/:orderId/addReview - Add review order */
  .post(_order.default.addReview);
  router.route('/:orderId/payment')
  /** POST /api/:orderId/payment - Complete payment for order */
  .post(_order.default.updatePayment);
  router.route('/:order/partners')
  /** GET /api/order/:orderId/partners - Get partners */
  .get(_order.default.getAvailablePartners);
  router.route('/:orderId/partner/reject')
  /** GET /api/order/:orderId/partner/reject - Get partners */
  .get(_order.default.rejectOrderForPartner);
  /** Load order when API with orderId route parameter is hit **/

  router.param('orderId', _order.default.loadOrder);
  /** Load order when API with orderId route parameter is hit **/

  router.param('order', _order.default.loadOrder);
  return router;
}

var _default = orderRoutes;
exports.default = _default;
//# sourceMappingURL=order.routes.js.map
