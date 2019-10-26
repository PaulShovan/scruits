import express from 'express';
import orderCtrl from '../controllers/order.controller';
import customerCtrl from '../controllers/customer.controller';
import partnerCtrl from '../controllers/partner.controller';
import adminCtrl from '../controllers/admin.controller';
import cognitoExpress from '../configurations/cognitoexpress.configuration';

const router = express.Router();

function adminRoutes() {
  router.use(function(req, res, next) {
    //I'm passing in the access token in header under key accessToken
    let accessTokenFromClient = req.headers.accesstoken;
    //Fail if token not present in header. 
    if (!accessTokenFromClient) return res.status(401).send({
      status:"error",
      message:"Access Token missing from header"
    });
   
    cognitoExpress.validate(accessTokenFromClient, function(err, response) {    
      //If API is not authenticated, Return 401 with error message. 
      if (err) {
        return res.status(401).send({
          status:"error",
          message: err
        });
      } else if(response['custom:role'] != 'admin') {
        return res.status(401).send({
          status:"error",
          message:"Only admin is allowed!"
        });
      }
      //Else API has been authenticated. Proceed.
      req.authUser = response;
      console.log(req.authUser);
      next();
    });
  });
  
  router.route('/count')
  /** GET /api/admin/count/- Get count of order, partner, customer */
    .get(adminCtrl.totalOrderPartnerCustomer)
  
  router.route('/add')
    /** GET /api/admin/add/- Get count of order, partner, customer */
    .post(adminCtrl.addAdmin)
  
    router.route('/order')
  /** GET /api/admin/order/- Get order list */
    .get(orderCtrl.get)

  router.route('/order/:orderId')
    /** GET /api/admin/order/:orderId - Get order */
    .get(orderCtrl.getOrder)

    /** PUT /api/order/:orderId - Update order */
    .put(orderCtrl.update);

  router.route('/customer')
  /** GET /api/admin/customer/- Get customer list */
    .get(customerCtrl.get)

  router.route('/customer/:customerId')
    /** GET /api/admin/customer/:customerId - Get customer */
    .get(customerCtrl.getCustomer)

    /** PUT /api/admin/customer/:orderId - Update order */
    .put(customerCtrl.update);
  
  router.route('/customer/:customerId/orders')
    /** GET /api/admin/customer/:customerId - Get customer */
    .get(customerCtrl.getOrders)

  router.route('/partner')
  /** GET /api/admin/partner/- Get partner list */
    .get(partnerCtrl.get)

  router.route('/partner/:partnerId')
    /** GET /api/admin/partner/:partnerId - Get partner */
    .get(partnerCtrl.getPartner)

    /** PUT /api/admin/partner/:partnerId - Update partner */
    .put(partnerCtrl.update);
  
  /** Load partner when API with partnerId route parameter is hit **/ 
  router.param('partnerId', partnerCtrl.load);

  /** Load order when API with orderId route parameter is hit **/ 
  router.param('orderId', orderCtrl.loadOrder);

  /** Load customer when API with customerId route parameter is hit **/ 
  router.param('customerId', customerCtrl.loadCustomer);

  return router;
}

export default adminRoutes;