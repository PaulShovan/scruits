import express from 'express';
import quoteCtrl from '../controllers/quote.controller';
import orderCtrl from '../controllers/order.controller';
import cognitoExpress from '../configurations/cognitoexpress.configuration';

const router = express.Router();

function quoteRoutes() {
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
  /** GET Add new quote */
    .get(orderCtrl.getQuotes)

  router.route('/:orderId/add')
  /** POST Add new quote */
    .post(quoteCtrl.add)

  router.route('/:quoteId')
    /** GET /api/quote/:orderId - Get quote */
    .get(quoteCtrl.getQuote)

    /** PUT /api/order/:orderId - Update order */
    .put(quoteCtrl.update);

  router.route('/:quoteId/accept')
    /** GET /api/quote/:orderId - Get quote */
    .get(quoteCtrl.acceptQuote)

  router.route('/:quoteId/reject')
    /** GET /api/quote/:orderId - Get quote */
    .get(quoteCtrl.rejectQuote)

  /** Load order when API with orderId route parameter is hit **/ 
  router.param('orderId', quoteCtrl.loadOrder);

  /** Load order when API with orderId route parameter is hit **/ 
  router.param('quoteId', quoteCtrl.loadQuote);

  return router;
}

export default quoteRoutes;