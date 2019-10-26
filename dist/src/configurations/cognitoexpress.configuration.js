"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _cognitoExpress = _interopRequireDefault(require("cognito-express"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cognitoExpress = new _cognitoExpress.default({
  region: "us-east-1",
  cognitoUserPoolId: "us-east-1_FhioeMi1z",
  tokenUse: "id",
  //Possible Values: access | id
  tokenExpiration: 3600000 //Up to default expiration of 1 hour (3600000 ms)

});
var _default = cognitoExpress;
exports.default = _default;
//# sourceMappingURL=cognitoexpress.configuration.js.map
