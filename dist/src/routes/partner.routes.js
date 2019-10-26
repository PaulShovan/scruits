"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _partner = _interopRequireDefault(require("../controllers/partner.controller"));

var _cognitoexpress = _interopRequireDefault(require("../configurations/cognitoexpress.configuration"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express.default.Router();

function partnerRoutes() {
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
  router.route('/profile/:partnerId')
  /** GET /api/partner/:partnerId - Get partner */
  .get(_partner.default.getPartner)
  /** PUT /api/partner/:partnerId - Update partner */
  .put(_partner.default.update);
  router.route('/profile')
  /** GET /api/partner/profile - Get partner profile */
  .get(_partner.default.profile).post(_partner.default.updatePartner);
  router.route('/profile/photos')
  /** POST /api/partner/profile/photos - Upload partner profile images */
  .post(_partner.default.uploadPhotos);
  router.route('/profile/profilephoto')
  /** POST /api/partner/profile/photos - Upload partner profile images */
  .post(_partner.default.updateProfilePhoto);
  router.route('/services')
  /** GET /api/partner/profile - Get partner profile */
  .get(_partner.default.getServices);
  router.route('/services/associate')
  /** GET /api/partner/profile - Get partner profile */
  .post(_partner.default.associateServices);
  router.route('/serviceitems')
  /** GET /api/partner/profile - Get partner profile */
  .get(_partner.default.getServiceItems);
  router.route('/orders')
  /** GET /api/partner/orders - Get partner orders */
  .get(_partner.default.orders);
  router.route('/reviews')
  /** GET /api/partner/reviews - Get partner reviews */
  .get(_partner.default.reviews);
  router.route('/newleads')
  /** GET /api/partner/orderstoquote - Get partner orders to quote */
  .get(_partner.default.getOrdersForPartnerToQuote);
  router.route('/ongoing')
  /** GET /api/partner/orderstoquote - Get partner orders to quote */
  .get(_partner.default.getOngoingOrders);
  /** Load partner when API with partnerId route parameter is hit **/

  router.param('partnerId', _partner.default.load);
  return router;
}

var _default = partnerRoutes;
exports.default = _default;
//# sourceMappingURL=partner.routes.js.map
