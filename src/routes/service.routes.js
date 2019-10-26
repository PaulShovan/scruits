import express from 'express';
import validate from 'express-validation';
import cognitoExpress from '../configurations/cognitoexpress.configuration';
import paramValidation from '../helpers/param.validation';
import serviceCtrl from '../controllers/service.controller';

const router = express.Router();

function serviceRoutes() {
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
    /** POST /api/service- Add new service */
    .post(serviceCtrl.add)
    /** GET /api/service - Get services */
    .get(serviceCtrl.getServices);

  router.route('/search')
    /** GET /api/service - Get services */
    .get(serviceCtrl.getMatchedServices);

  router.route('/:serviceId')
    /** GET /api/service/:serviceId - Get service */
    .get(serviceCtrl.getService)

    /** PUT /api/service/:serviceId - Update service */
    .put(serviceCtrl.update);
  
  router.route('/:serviceId/updatephoto')
    /** GET /api/service/:serviceId/updatephoto - Update service photo */
    .post(serviceCtrl.updateServicePhoto)

  router.route('/category/:categoryId')
    /** GET /api/service/category/:categoryId - Get service */
    .get(serviceCtrl.getServiceByCategory)
  
  /** Load service when API with serviceId route parameter is hit **/ 
  router.param('serviceId', serviceCtrl.load);

  router.param('categoryId', serviceCtrl.loadServiceByCategory);

  return router;
}

export default serviceRoutes;