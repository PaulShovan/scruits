import express from 'express';
import validate from 'express-validation';
import paramValidation from '../helpers/param.validation';
import authCtrl from '../controllers/auth.controller';
import customerCtrl from '../controllers/customer.controller';
import partnerCtrl from '../controllers/partner.controller';

const router = express.Router();

function authRoutes() {
  router.route('/register')
    /** POST /api/auth/register - Register new user */
    .post(validate(paramValidation.register), authCtrl.register);
  
  router.route('/customer/register')
    /** POST /api/auth/customer/register - Register new customer */
    .post(validate(paramValidation.register_customer), customerCtrl.add);

  router.route('/partner/register')
    /** POST /api/auth/partner/register - Register new partner */
    .post(validate(paramValidation.register_partner), partnerCtrl.add);

  router.route('/login')
    /** POST /api/auth/login - Login new user */
    .post(validate(paramValidation.login), authCtrl.login);

  router.route('/adddevice')
    /** POST /api/auth/adddevice - Add/Update device id */
    .post(authCtrl.addDevice);
  
  router.route('/verify')
    /** POST /api/auth/verify - Verify new user */
    .post(validate(paramValidation.verify), authCtrl.confirmRegistration);
  
  router.route('/renew')
    /** POST /api/auth/renew - Renew using refresh token */
    .post(validate(paramValidation.renew), authCtrl.renew);

  router.route('/resend')
    /** POST /api/auth/resend - Renew using refresh token */
    .post(authCtrl.resendConfirmationCode);
  
  router.route('/updatepassword')
    /** POST /api/auth/updatepassword - Update password */
    .post(validate(paramValidation.newpassword), authCtrl.changePassword);

  router.route('/forgotpassword')
  /** POST /api/auth/forgotpassword - Forgot password */
      .post(validate(paramValidation.forgotpassword), authCtrl.forgotPassword);

  router.route('/confirmpassword')
  /** POST /api/auth/confirmpassword - Confirm password */
      .post(validate(paramValidation.confirmpassword), authCtrl.confirmPassword);

  return router;
}

export default authRoutes;
