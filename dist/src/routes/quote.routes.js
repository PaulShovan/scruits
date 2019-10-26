"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _quote = _interopRequireDefault(require("../controllers/quote.controller"));

var _order = _interopRequireDefault(require("../controllers/order.controller"));

var _cognitoexpress = _interopRequireDefault(require("../configurations/cognitoexpress.configuration"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express.default.Router();

function quoteRoutes() {
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
  /** GET Add new quote */
  .get(_order.default.getQuotes);
  router.route('/:orderId/add')
  /** POST Add new quote */
  .post(_quote.default.add);
  router.route('/:quoteId')
  /** GET /api/quote/:orderId - Get quote */
  .get(_quote.default.getQuote)
  /** PUT /api/order/:orderId - Update order */
  .put(_quote.default.update);
  router.route('/:quoteId/accept')
  /** GET /api/quote/:orderId - Get quote */
  .get(_quote.default.acceptQuote);
  router.route('/:quoteId/reject')
  /** GET /api/quote/:orderId - Get quote */
  .get(_quote.default.rejectQuote);
  /** Load order when API with orderId route parameter is hit **/

  router.param('orderId', _quote.default.loadOrder);
  /** Load order when API with orderId route parameter is hit **/

  router.param('quoteId', _quote.default.loadQuote);
  return router;
}

var _default = quoteRoutes;
exports.default = _default;
//# sourceMappingURL=quote.routes.js.map
