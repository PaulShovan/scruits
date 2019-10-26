import express from 'express';
import cognitoExpress from '../configurations/cognitoexpress.configuration';
import chatCtrl from '../controllers/chat.controller';

const router = express.Router();

function chatRoutes() {
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

  router.route('/chatauth')
    /** GET /api/chatauth - Authenticate chat user */
    .get(chatCtrl.authenticateUser);

  router.route('/chatusers')
    /** GET /api/chatusers - Add chat user */
    .post(chatCtrl.addChatUser)

  return router;
}

export default chatRoutes;