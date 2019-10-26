import express from 'express';
import partnerCtrl from '../controllers/partner.controller';
import cognitoExpress from '../configurations/cognitoexpress.configuration';

const router = express.Router();

function partnerRoutes() {
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
  router.route('/profile/:partnerId')
    /** GET /api/partner/:partnerId - Get partner */
    .get(partnerCtrl.getPartner)

    /** PUT /api/partner/:partnerId - Update partner */
    .put(partnerCtrl.update);
  
  router.route('/profile')
    /** GET /api/partner/profile - Get partner profile */
    .get(partnerCtrl.profile)

    .post(partnerCtrl.updatePartner)
  
  router.route('/profile/photos')
    /** POST /api/partner/profile/photos - Upload partner profile images */
    .post(partnerCtrl.uploadPhotos)
    
  router.route('/profile/profilephoto')
    /** POST /api/partner/profile/photos - Upload partner profile images */
    .post(partnerCtrl.updateProfilePhoto)
  
  router.route('/services')
    /** GET /api/partner/profile - Get partner profile */
    .get(partnerCtrl.getServices)
  
  router.route('/services/associate')
    /** GET /api/partner/profile - Get partner profile */
    .post(partnerCtrl.associateServices)
  
  router.route('/serviceitems')
    /** GET /api/partner/profile - Get partner profile */
    .get(partnerCtrl.getServiceItems)

  router.route('/orders')
    /** GET /api/partner/orders - Get partner orders */
    .get(partnerCtrl.orders)
  
  router.route('/reviews')
    /** GET /api/partner/reviews - Get partner reviews */
    .get(partnerCtrl.reviews)

  router.route('/newleads')
    /** GET /api/partner/orderstoquote - Get partner orders to quote */
    .get(partnerCtrl.getOrdersForPartnerToQuote)
  
  router.route('/ongoing')
    /** GET /api/partner/orderstoquote - Get partner orders to quote */
    .get(partnerCtrl.getOngoingOrders)
  
  /** Load partner when API with partnerId route parameter is hit **/ 
  router.param('partnerId', partnerCtrl.load);
  return router;
}

export default partnerRoutes;