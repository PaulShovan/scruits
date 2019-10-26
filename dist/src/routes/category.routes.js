"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidation = _interopRequireDefault(require("express-validation"));

var _cognitoexpress = _interopRequireDefault(require("../configurations/cognitoexpress.configuration"));

var _param = _interopRequireDefault(require("../helpers/param.validation"));

var _category = _interopRequireDefault(require("../controllers/category.controller"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express.default.Router();

function categoryRoutes() {
  router.use(function (req, res, next) {
    //I'm passing in the access token in header under key accessToken
    var accessTokenFromClient = req.headers.accesstoken; //Fail if token not present in header. 

    if (!accessTokenFromClient) return res.status(401).send({
      status: "error",
      message: "Access Token missing from header"
    });

    _cognitoexpress.default.validate(accessTokenFromClient, function (err, response) {
      //If API is not authenticated, Return 401 with error message. 
      if (err) return res.status(401).send({
        status: "error",
        message: err
      }); //Else API has been authenticated. Proceed.

      req.authUser = response;
      console.log(req.authUser);
      next();
    });
  });
  router.route('/')
  /** POST /api/category - Add new service */
  .post(_category.default.add)
  /** GET /api/category/ - Get all categories */
  .get(_category.default.getAll);
  router.route('/:categoryId')
  /** GET /api/:categoryId/ - Get a category */
  .get(_category.default.getCategory)
  /** PUT /api/:categoryId/ - Update a category */
  .put(_category.default.update);
  router.route('/:categoryId/updatephoto')
  /** POST /api/:categoryId/updatephoto - Update category photo */
  .post(_category.default.updateCategoryPhoto);
  /** Load service when API with serviceId route parameter is hit **/

  router.param('categoryId', _category.default.loadCategory);
  return router;
}

var _default = categoryRoutes;
exports.default = _default;
//# sourceMappingURL=category.routes.js.map
