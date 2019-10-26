"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _amazonCognitoIdentityJs = require("amazon-cognito-identity-js");

var poolData = {
  UserPoolId: 'us-east-1_FhioeMi1z',
  ClientId: '7rsud5o0n25ubua6q68u4ilhgg'
};
var userPool = new _amazonCognitoIdentityJs.CognitoUserPool(poolData);
var _default = {
  userPool: userPool
};
exports.default = _default;
//# sourceMappingURL=cognito.configurations.js.map
