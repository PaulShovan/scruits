"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidation = _interopRequireDefault(require("express-validation"));

var _cognitoexpress = _interopRequireDefault(require("../configurations/cognitoexpress.configuration"));

var _param = _interopRequireDefault(require("../helpers/param.validation"));

var _service = _interopRequireDefault(require("../controllers/service.controller"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express.default.Router();

function serviceRoutes() {
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
  /** POST /api/service- Add new service */
  .post(_service.default.add)
  /** GET /api/service - Get services */
  .get(_service.default.getServices);
  router.route('/search')
  /** GET /api/service - Get services */
  .get(_service.default.getMatchedServices);
  router.route('/:serviceId')
  /** GET /api/service/:serviceId - Get service */
  .get(_service.default.getService)
  /** PUT /api/service/:serviceId - Update service */
  .put(_service.default.update);
  router.route('/:serviceId/updatephoto')
  /** GET /api/service/:serviceId/updatephoto - Update service photo */
  .post(_service.default.updateServicePhoto);
  router.route('/category/:categoryId')
  /** GET /api/service/category/:categoryId - Get service */
  .get(_service.default.getServiceByCategory);
  /** Load service when API with serviceId route parameter is hit **/

  router.param('serviceId', _service.default.load);
  router.param('categoryId', _service.default.loadServiceByCategory);
  return router;
}

var _default = serviceRoutes;
exports.default = _default;
//# sourceMappingURL=service.routes.js.map
