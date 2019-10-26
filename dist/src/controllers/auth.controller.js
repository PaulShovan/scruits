"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _amazonCognitoIdentityJs = require("amazon-cognito-identity-js");

var _cognito = _interopRequireDefault(require("../configurations/cognito.configurations"));

var _device = _interopRequireDefault(require("../models/device.model"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

global.fetch = require('node-fetch'); // to get rid if fetch undefined error

var register = function register(data, role) {
  return new Promise(function (resolve, reject) {
    var attributeList = [];
    var dataEmail = {
      Name: 'email',
      Value: data.email
    };
    var dataRole = {
      Name: 'custom:role',
      Value: role
    };
    var dataUserId = {
      Name: 'custom:user_id',
      Value: data.user_id
    };
    var dataId = {
      Name: 'custom:_id',
      Value: data._id
    };
    var attributeEmail = new _amazonCognitoIdentityJs.CognitoUserAttribute(dataEmail);
    var attributeRole = new _amazonCognitoIdentityJs.CognitoUserAttribute(dataRole);
    var attributeUserId = new _amazonCognitoIdentityJs.CognitoUserAttribute(dataUserId);
    var attributeId = new _amazonCognitoIdentityJs.CognitoUserAttribute(dataId);
    attributeList.push(attributeEmail);
    attributeList.push(attributeRole);
    attributeList.push(attributeUserId);
    attributeList.push(attributeId);

    _cognito.default.userPool.signUp(data.email, data.password, attributeList, null, function (err, result) {
      if (err) {
        console.log(err);
        reject(err);
      }

      console.log('user name is ' + result.user.username);
      resolve({
        status: "success",
        result: {
          email: result.user.username
        }
      });
    });
  });
};

var confirmRegistration = function confirmRegistration(req, res, next) {
  var userData = {
    Username: req.body.email,
    Pool: _cognito.default.userPool
  };
  var cognitoUser = new _amazonCognitoIdentityJs.CognitoUser(userData);
  cognitoUser.confirmRegistration(req.body.code, true, function (err, result) {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: err.message
      });
    }

    return res.json({
      status: "success",
      result: result
    });
  });
};

var login = function login(req, res, next) {
  var authenticationDetails = new _amazonCognitoIdentityJs.AuthenticationDetails({
    Username: req.body.email,
    Password: req.body.password
  });
  var userData = {
    Username: req.body.email,
    Pool: _cognito.default.userPool
  };
  var cognitoUser = new _amazonCognitoIdentityJs.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function onSuccess(result) {
      var timeNow = new Date();
      return res.status(200).json({
        status: "success",
        result: {
          email: req.body.email,
          token: result.idToken.jwtToken,
          refreshToken: result.getRefreshToken().getToken(),
          role: result.idToken.payload['custom:role'],
          tokenValidity: timeNow.getTime() + 60000
        }
      });
    },
    onFailure: function onFailure(err) {
      return res.status(500).json({
        status: "error",
        message: err
      });
    }
  });
};

var renew = function renew(req, res, next) {
  var RefreshToken = new _amazonCognitoIdentityJs.CognitoRefreshToken({
    RefreshToken: req.body.refreshToken
  });
  var userData = {
    Username: req.body.email,
    Pool: _cognito.default.userPool
  };
  var cognitoUser = new _amazonCognitoIdentityJs.CognitoUser(userData);
  cognitoUser.refreshSession(RefreshToken, function (err, result) {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: err
      });
    } else {
      var timeNow = new Date();
      return res.json({
        status: "success",
        result: {
          email: req.body.email,
          token: result.idToken.jwtToken,
          refreshToken: result.refreshToken.token,
          tokenValidity: timeNow.getTime() + 60000
        }
      });
    }
  });
};

var changePassword = function changePassword(req, res, next) {
  var authenticationDetails = new _amazonCognitoIdentityJs.AuthenticationDetails({
    Username: req.body.email,
    Password: req.body.password
  });
  var userData = {
    Username: req.body.email,
    Pool: _cognito.default.userPool
  };
  var cognitoUser = new _amazonCognitoIdentityJs.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function onSuccess(result) {
      cognitoUser.changePassword(req.body.password, req.body.newpassword, function (err, result) {
        if (err) {
          return res.status(500).json({
            status: "error",
            message: err
          });
        } else {
          return res.json({
            status: "success",
            result: result
          });
        }
      });
    },
    onFailure: function onFailure(err) {
      return res.status(500).json({
        status: "error",
        message: err
      });
    }
  });
};

var forgotPassword = function forgotPassword(req, res, next) {
  var userData = {
    Username: req.body.email,
    Pool: _cognito.default.userPool
  };
  var cognitoUser = new _amazonCognitoIdentityJs.CognitoUser(userData);
  cognitoUser.forgotPassword({
    onSuccess: function onSuccess(result) {
      return res.status(200).json({
        status: "success",
        result: result
      });
    },
    onFailure: function onFailure(err) {
      return res.status(500).json({
        status: "error",
        message: err
      });
    }
  });
};

var confirmPassword = function confirmPassword(req, res, next) {
  var userData = {
    Username: req.body.email,
    Pool: _cognito.default.userPool
  };
  var cognitoUser = new _amazonCognitoIdentityJs.CognitoUser(userData);
  cognitoUser.confirmPassword(req.body.code, req.body.newpassword, {
    onSuccess: function onSuccess(result) {
      return res.status(200).json({
        status: "success",
        result: result
      });
    },
    onFailure: function onFailure(err) {
      return res.status(500).json({
        status: "error",
        message: err
      });
    }
  });
};

var resendConfirmationCode = function resendConfirmationCode(req, res, next) {
  var userData = {
    Username: req.body.email,
    Pool: _cognito.default.userPool
  };
  var cognitoUser = new _amazonCognitoIdentityJs.CognitoUser(userData);
  cognitoUser.resendConfirmationCode(function (err, result) {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: err.message
      });
    }

    return res.json({
      status: "success",
      result: result
    });
  });
};

var addDevice = function addDevice(req, res) {
  console.log(req.body);

  _device.default.findOneAndUpdate({
    user_email: req.body.email
  }, {
    user_email: req.body.email,
    device_id: req.body.deviceId || 0,
    platform: req.body.platform || 'android'
  }, {
    upsert: true
  }, function (err, doc) {
    if (err) return res.status(500).send({
      status: "error",
      message: err
    });
    console.log(doc);
    return res.status(200).json({
      status: "success",
      result: 'Device Id added successfully'
    });
  });
};

var _default = {
  register: register,
  login: login,
  confirmRegistration: confirmRegistration,
  renew: renew,
  changePassword: changePassword,
  forgotPassword: forgotPassword,
  confirmPassword: confirmPassword,
  resendConfirmationCode: resendConfirmationCode,
  addDevice: addDevice
};
exports.default = _default;
//# sourceMappingURL=auth.controller.js.map
