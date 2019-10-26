import express from 'express';
import validate from 'express-validation';
import cognitoExpress from '../configurations/cognitoexpress.configuration';
import paramValidation from '../helpers/param.validation';
import categoryCtrl from '../controllers/category.controller';

const router = express.Router();

function categoryRoutes() {
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
    /** POST /api/category - Add new service */
    .post(categoryCtrl.add)
    /** GET /api/category/ - Get all categories */
    .get(categoryCtrl.getAll)

  router.route('/:categoryId')
    /** GET /api/:categoryId/ - Get a category */
    .get(categoryCtrl.getCategory)
    /** PUT /api/:categoryId/ - Update a category */
    .put(categoryCtrl.update);

  router.route('/:categoryId/updatephoto')
    /** POST /api/:categoryId/updatephoto - Update category photo */
    .post(categoryCtrl.updateCategoryPhoto)


 /** Load service when API with serviceId route parameter is hit **/ 
  router.param('categoryId', categoryCtrl.loadCategory);

  return router;
}

export default categoryRoutes;