import express from 'express';
import orderCtrl from '../controllers/order.controller';
import cognitoExpress from '../configurations/cognitoexpress.configuration';

const router = express.Router();

function orderRoutes() {
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
  router.route('/')
  /** GET /api/order/- Get order list */
    .get(orderCtrl.get)

  /** GET /api/order/- Add new order */
    .post(orderCtrl.add)

  router.route('/:orderId')
    /** GET /api/order/:orderId - Get order */
    .get(orderCtrl.getOrder)

    /** PUT /api/order/:orderId - Update order */
    .put(orderCtrl.update);
  
  router.route('/:orderId/addreview')
    /** POST /api/:orderId/addReview - Add review order */
    .post(orderCtrl.addReview);

  router.route('/:orderId/payment')
    /** POST /api/:orderId/payment - Complete payment for order */
    .post(orderCtrl.updatePayment);

  router.route('/:order/partners')
    /** GET /api/order/:orderId/partners - Get partners */
    .get(orderCtrl.getAvailablePartners)
  
  router.route('/:orderId/partner/reject')
    /** GET /api/order/:orderId/partner/reject - Get partners */
    .get(orderCtrl.rejectOrderForPartner)

  /** Load order when API with orderId route parameter is hit **/ 
  router.param('orderId', orderCtrl.loadOrder);

  /** Load order when API with orderId route parameter is hit **/ 
  router.param('order', orderCtrl.loadOrder);

  return router;
}

export default orderRoutes;