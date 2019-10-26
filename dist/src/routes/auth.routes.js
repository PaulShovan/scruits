"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidation = _interopRequireDefault(require("express-validation"));

var _param = _interopRequireDefault(require("../helpers/param.validation"));

var _auth = _interopRequireDefault(require("../controllers/auth.controller"));

var _customer = _interopRequireDefault(require("../controllers/customer.controller"));

var _partner = _interopRequireDefault(require("../controllers/partner.controller"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express.default.Router();

function authRoutes() {
  router.route('/register')
  /** POST /api/auth/register - Register new user */
  .post((0, _expressValidation.default)(_param.default.register), _auth.default.register);
  router.route('/customer/register')
  /** POST /api/auth/customer/register - Register new customer */
  .post((0, _expressValidation.default)(_param.default.register_customer), _customer.default.add);
  router.route('/partner/register')
  /** POST /api/auth/partner/register - Register new partner */
  .post((0, _expressValidation.default)(_param.default.register_partner), _partner.default.add);
  router.route('/login')
  /** POST /api/auth/login - Login new user */
  .post((0, _expressValidation.default)(_param.default.login), _auth.default.login);
  router.route('/adddevice')
  /** POST /api/auth/adddevice - Add/Update device id */
  .post(_auth.default.addDevice);
  router.route('/verify')
  /** POST /api/auth/verify - Verify new user */
  .post((0, _expressValidation.default)(_param.default.verify), _auth.default.confirmRegistration);
  router.route('/renew')
  /** POST /api/auth/renew - Renew using refresh token */
  .post((0, _expressValidation.default)(_param.default.renew), _auth.default.renew);
  router.route('/resend')
  /** POST /api/auth/resend - Renew using refresh token */
  .post(_auth.default.resendConfirmationCode);
  router.route('/updatepassword')
  /** POST /api/auth/updatepassword - Update password */
  .post((0, _expressValidation.default)(_param.default.newpassword), _auth.default.changePassword);
  router.route('/forgotpassword')
  /** POST /api/auth/forgotpassword - Forgot password */
  .post((0, _expressValidation.default)(_param.default.forgotpassword), _auth.default.forgotPassword);
  router.route('/confirmpassword')
  /** POST /api/auth/confirmpassword - Confirm password */
  .post((0, _expressValidation.default)(_param.default.confirmpassword), _auth.default.confirmPassword);
  return router;
}

var _default = authRoutes;
exports.default = _default;
//# sourceMappingURL=auth.routes.js.map
