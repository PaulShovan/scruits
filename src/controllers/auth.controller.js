global.fetch = require('node-fetch') // to get rid if fetch undefined error
import {CognitoUserAttribute, CognitoUser, AuthenticationDetails, CognitoRefreshToken} from 'amazon-cognito-identity-js';
import cognito from '../configurations/cognito.configurations';
import Device from '../models/device.model';

const register = (data, role) => {
  return new Promise((resolve, reject) => {
    const attributeList = [];  
    const dataEmail = {
      Name : 'email',
      Value : data.email
    };
    const dataRole = {
      Name : 'custom:role',
      Value : role
    };
    const dataUserId = {
      Name : 'custom:user_id',
      Value : data.user_id
    };
    const dataId = {
      Name : 'custom:_id',
      Value : data._id
    };
    const attributeEmail = new CognitoUserAttribute(dataEmail);
    const attributeRole = new CognitoUserAttribute(dataRole);
    const attributeUserId = new CognitoUserAttribute(dataUserId);
    const attributeId = new CognitoUserAttribute(dataId);
    attributeList.push(attributeEmail);
    attributeList.push(attributeRole);
    attributeList.push(attributeUserId);
    attributeList.push(attributeId);
    cognito.userPool.signUp(data.email, data.password, attributeList, null, function(err, result){
      if (err) {
        console.log(err);
        reject(err)
      }
      console.log('user name is ' + result.user.username);
      resolve({
        status: "success",
        result: { email: result.user.username }
      });
    });
  })
}

const confirmRegistration = (req, res, next) => {
  var userData = {
    Username : req.body.email,
    Pool : cognito.userPool
  };
 
  var cognitoUser = new CognitoUser(userData);
  cognitoUser.confirmRegistration(req.body.code, true, function(err, result) {
    if (err) {
      return res.status(500).json({
        status:"error",
        message:err.message
      });
    }
    return res.json({
      status: "success",
      result: result
    });
});
}

const login = (req, res, next) => {
  var authenticationDetails = new AuthenticationDetails({
    Username : req.body.email,
    Password : req.body.password
  });
  var userData = {
    Username : req.body.email,
    Pool : cognito.userPool
  };
  var cognitoUser = new CognitoUser(userData);
  
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      const timeNow = new Date();
      return res.status(200).json({
        status: "success",
        result: {
          email: req.body.email,
          token: result.idToken.jwtToken,
          refreshToken: result.getRefreshToken().getToken(),
          role: result.idToken.payload['custom:role'],
          tokenValidity: timeNow.getTime() + 60000
        }
      })
    },

    onFailure: function(err) {
      return res.status(500).json({
        status:"error",
        message:err
      })
    }
  });
}

const renew = (req, res, next) => {
  const RefreshToken = new CognitoRefreshToken({RefreshToken: req.body.refreshToken});
  const userData = {
    Username: req.body.email,
    Pool: cognito.userPool
  };

  const cognitoUser = new CognitoUser(userData);

  cognitoUser.refreshSession(RefreshToken, (err, result) => {
    if (err) {
        return res.status(500).json({
          status:"error",
          message:err
        });
    } else {
        const timeNow = new Date();
        return res.json({
          status: "success",
          result: {
            email: req.body.email,
            token: result.idToken.jwtToken,
            refreshToken: result.refreshToken.token,
            tokenValidity: timeNow.getTime() + 60000
          }
        })
    }
  })
}

const changePassword = (req, res, next) => {
    var authenticationDetails = new AuthenticationDetails({
        Username : req.body.email,
        Password : req.body.password
      });
      var userData = {
        Username : req.body.email,
        Pool : cognito.userPool
      };
      var cognitoUser = new CognitoUser(userData);
      
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            cognitoUser.changePassword(req.body.password, req.body.newpassword, (err, result) => {
                if (err) {
                    return res.status(500).json({
                      status:"error",
                      message:err
                    })
                } else {
                    return res.json({
                      status: "success",
                      result: result
                    })
                }
            });
        },
    
        onFailure: function(err) {
          return res.status(500).json({
            status:"error",
            message:err
          })
        }
      });
}

const forgotPassword = (req, res, next) => {
  var userData = {
    Username : req.body.email,
    Pool : cognito.userPool
  };

  var cognitoUser = new CognitoUser(userData);

  cognitoUser.forgotPassword({
    onSuccess: function (result) {
      return res.status(200).json({
        status: "success",
        result: result
      })
    },
    onFailure: function(err) {
      return res.status(500).json({
        status:"error",
        message:err
      })
    }
  });
}

const confirmPassword = (req, res, next) => {
  var userData = {
    Username : req.body.email,
    Pool : cognito.userPool
  };

  var cognitoUser = new CognitoUser(userData);

  cognitoUser.confirmPassword(req.body.code, req.body.newpassword, {
    onSuccess: function (result) {
      return res.status(200).json({
        status: "success",
        result: result
      })
    },
    onFailure: function(err) {
      return res.status(500).json({
        status:"error",
        message:err
      })
    }
  });
}

const resendConfirmationCode = (req, res, next) => {
  var userData = {
    Username : req.body.email,
    Pool : cognito.userPool
  };
 
  var cognitoUser = new CognitoUser(userData);
  cognitoUser.resendConfirmationCode(function(err, result) {
    if (err) {
      return res.status(500).json({
        status:"error",
        message:err.message
      });
    }
    return res.json({
      status: "success",
      result: result
    });
});
}

const addDevice = (req, res) => {
  console.log(req.body);
  Device.findOneAndUpdate({ user_email: req.body.email }, {
    user_email: req.body.email,
    device_id: req.body.deviceId || 0,
    platform: req.body.platform || 'android'
  }, {upsert:true}, function(err, doc){
    if (err) return res.status(500).send({
      status:"error",
      message:err
    });
    console.log(doc);
    return res.status(200).json({
      status: "success",
      result: 'Device Id added successfully'
    });
  });
}

export default {register, login, confirmRegistration, renew, changePassword, forgotPassword, confirmPassword, resendConfirmationCode, addDevice}
