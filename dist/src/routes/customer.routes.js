"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidation = _interopRequireDefault(require("express-validation"));

var _param = _interopRequireDefault(require("../helpers/param.validation"));

var _customer = _interopRequireDefault(require("../controllers/customer.controller"));

var _cognitoexpress = _interopRequireDefault(require("../configurations/cognitoexpress.configuration"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express.default.Router();

function authRoutes() {
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
  router.route('/register')
  /** POST /api/customer/register - Register new customer */
  .post((0, _expressValidation.default)(_param.default.register_customer), _customer.default.add);
  router.route('/profile')
  /** GET /api/customer/profile - Get customer profile*/
  .get(_customer.default.profile).post(_customer.default.updateCustomer);
  router.route('/nearbypartners')
  /** GET /api/customer/nearbypartners - Get nearby partners*/
  .get(_customer.default.getNearbyPartners);
  router.route('/profile/photo')
  /** POST /api/customer/profile/photo - Update profile photo*/
  .post(_customer.default.updateProfilePhoto);
  router.route('/orders')
  /** GET /api/customer/orders - Get customer orders*/
  .get(_customer.default.orders);
  router.route('/profile/:customerId')
  /** GET /api/customer/:customerId - Get customer */
  .get(_customer.default.getCustomer)
  /** PUT /api/customer/:customerId - Update customer */
  .put(_customer.default.update);
  /** Load customer when API with customerId route parameter is hit **/

  router.param('customerId', _customer.default.loadCustomer);
  return router;
}

var _default = authRoutes;
exports.default = _default;
//# sourceMappingURL=customer.routes.js.map
