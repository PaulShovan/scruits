import express from 'express';
import validate from 'express-validation';
import paramValidation from '../helpers/param.validation';
import customerCtrl from '../controllers/customer.controller';
import cognitoExpress from '../configurations/cognitoexpress.configuration';

const router = express.Router();

function authRoutes() {
  router.use(function(req, res, next) {
    //I'm passing in the access token in header under key accessToken
    let accessTokenFromClient = req.headers.accesstoken;
    //Fail if token not present in header. 
    if (!accessTokenFromClient) return res.status(401).send({
      status:"error",
      message: "Access Token missing from header"
    });
   
    cognitoExpress.validate(accessTokenFromClient, function(err, response) {    
      //If API is not authenticated, Return 401 with error message. 
      if (err) return res.status(401).send({
        status:"error",
        message: err
      });
      //Else API has been authenticated. Proceed.
      req.authUser = response;
      console.log(req.authUser);
      next();
    });
  });
  router.route('/register')
    /** POST /api/customer/register - Register new customer */
    .post(validate(paramValidation.register_customer), customerCtrl.add);
  
  router.route('/profile')
    /** GET /api/customer/profile - Get customer profile*/
    .get(customerCtrl.profile)
    
    .post(customerCtrl.updateCustomer)
  
  router.route('/nearbypartners')
    /** GET /api/customer/nearbypartners - Get nearby partners*/
    .get(customerCtrl.getNearbyPartners)

  router.route('/profile/photo')
    /** POST /api/customer/profile/photo - Update profile photo*/
    .post(customerCtrl.updateProfilePhoto)
  
  router.route('/orders')
    /** GET /api/customer/orders - Get customer orders*/
    .get(customerCtrl.orders)

  router.route('/profile/:customerId')
    /** GET /api/customer/:customerId - Get customer */
    .get(customerCtrl.getCustomer)

    /** PUT /api/customer/:customerId - Update customer */
    .put(customerCtrl.update);

  /** Load customer when API with customerId route parameter is hit **/ 
  router.param('customerId', customerCtrl.loadCustomer);

  return router;
}

export default authRoutes;