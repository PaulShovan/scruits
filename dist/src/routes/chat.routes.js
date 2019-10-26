"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _cognitoexpress = _interopRequireDefault(require("../configurations/cognitoexpress.configuration"));

var _chat = _interopRequireDefault(require("../controllers/chat.controller"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express.default.Router();

function chatRoutes() {
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
  router.route('/chatauth')
  /** GET /api/chatauth - Authenticate chat user */
  .get(_chat.default.authenticateUser);
  router.route('/chatusers')
  /** GET /api/chatusers - Add chat user */
  .post(_chat.default.addChatUser);
  return router;
}

var _default = chatRoutes;
exports.default = _default;
//# sourceMappingURL=chat.routes.js.map
