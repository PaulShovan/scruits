"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidation = _interopRequireDefault(require("express-validation"));

var _cognitoexpress = _interopRequireDefault(require("../configurations/cognitoexpress.configuration"));

var _param = _interopRequireDefault(require("../helpers/param.validation"));

var _serviceItem = _interopRequireDefault(require("../controllers/serviceItem.controller"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express.default.Router();

function serviceItemRoutes() {
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
  /** POST /api/serviceitem- Add new service */
  .post(_serviceItem.default.add)
  /** GET /api/serviceitem - Get services */
  .get(_serviceItem.default.getServiceItems);
  router.route('/:serviceItemId')
  /** GET /api/serviceitem/:serviceItemId - Get service */
  .get(_serviceItem.default.getServiceItemsById)
  /** DELETE /api/serviceitem/:serviceItemId - Delete service item */
  .delete(_serviceItem.default.deleteServiceItem)
  /** PUT /api/serviceitem/:serviceItemId - Update service */
  .put(_serviceItem.default.update);
  router.route('/:serviceItemId/updatephoto')
  /** GET /api/serviceitem/:serviceItemId/updatephoto - Update service photo */
  .post(_serviceItem.default.updateServiceItemPhoto);
  router.route('/service/:serviceId')
  /** GET /api/serviceitem/service/:serviceId - Get service items */
  .get(_serviceItem.default.getServiceItemsByServiceId).delete(_serviceItem.default.removeServiceItemByServiceAndPartnerId);
  router.route('/service/partner/:partnerId')
  /** GET /api/serviceitem/service/partner/:partnerId - Get service items */
  .get(_serviceItem.default.getServiceItemsByPartnerId);
  /** Load service when API with serviceId route parameter is hit **/

  router.param('serviceItemId', _serviceItem.default.load);
  router.param('serviceId', _serviceItem.default.loadServiceItemsByServiceId);
  router.param('partnerId', _serviceItem.default.loadServiceItemsByPartnerId);
  return router;
}

var _default = serviceItemRoutes;
exports.default = _default;
//# sourceMappingURL=serviceItem.routes.js.map
