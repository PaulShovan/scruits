import express from 'express';
import validate from 'express-validation';
import cognitoExpress from '../configurations/cognitoexpress.configuration';
import paramValidation from '../helpers/param.validation';
import serviceItemCtrl from '../controllers/serviceItem.controller';

const router = express.Router();

function serviceItemRoutes() {
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
    /** POST /api/serviceitem- Add new service */
    .post(serviceItemCtrl.add)
    /** GET /api/serviceitem - Get services */
    .get(serviceItemCtrl.getServiceItems);

  router.route('/:serviceItemId')
    /** GET /api/serviceitem/:serviceItemId - Get service */
    .get(serviceItemCtrl.getServiceItemsById)
    /** DELETE /api/serviceitem/:serviceItemId - Delete service item */
    .delete(serviceItemCtrl.deleteServiceItem)
    /** PUT /api/serviceitem/:serviceItemId - Update service */
    .put(serviceItemCtrl.update)
  
  router.route('/:serviceItemId/updatephoto')
    /** GET /api/serviceitem/:serviceItemId/updatephoto - Update service photo */
    .post(serviceItemCtrl.updateServiceItemPhoto)

  router.route('/service/:serviceId')
    /** GET /api/serviceitem/service/:serviceId - Get service items */
    .get(serviceItemCtrl.getServiceItemsByServiceId)

    .delete(serviceItemCtrl.removeServiceItemByServiceAndPartnerId)

  router.route('/service/partner/:partnerId')
    /** GET /api/serviceitem/service/partner/:partnerId - Get service items */
    .get(serviceItemCtrl.getServiceItemsByPartnerId)
  
  /** Load service when API with serviceId route parameter is hit **/ 
  router.param('serviceItemId', serviceItemCtrl.load);

  router.param('serviceId', serviceItemCtrl.loadServiceItemsByServiceId);

  router.param('partnerId', serviceItemCtrl.loadServiceItemsByPartnerId);

  return router;
}

export default serviceItemRoutes;