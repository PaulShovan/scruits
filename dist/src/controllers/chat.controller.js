"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _chatkitServer = _interopRequireDefault(require("@pusher/chatkit-server"));

var _customer = _interopRequireDefault(require("../models/customer.model"));

var _partner = _interopRequireDefault(require("../models/partner.model"));

var _admin = _interopRequireDefault(require("../models/admin.model"));

var _constants = require("../helpers/constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var chatkit = new _chatkitServer.default({
  instanceLocator: 'v1:us1:5fe5f4a3-222b-4b33-bf42-fa5174a7da74',
  key: '64740d6c-d5bb-4219-92be-fe639e181b54:Mu5AIwD0rFQXR9xbDLyQvUSABHAbLFnNxjWwx7N6Oko='
});

var getName = function getName(id, role) {
  return new Promise(function (resolve, reject) {
    if (role === _constants.roles.customer) {
      _customer.default.get(id).then(function (customer) {
        resolve("".concat(customer.first_name, " ").concat(customer.last_name));
      });
    } else if (role === _constants.roles.partner) {
      _partner.default.get(id).then(function (partner) {
        resolve("".concat(partner.first_name, " ").concat(partner.last_name));
      });
    } else {
      _admin.default.get(id).then(function (admin) {
        resolve(admin.name);
      });
    }
  });
};

var addChatUser = function addChatUser(req, res) {
  var userId = req.body.userId;
  getName(req.authUser['custom:_id'], req.authUser['custom:role']).then(function (name) {
    console.log(name);
    chatkit.createUser({
      id: userId,
      name: name
    }).then(function () {
      return res.status(201).json({
        status: "success",
        message: 'user created for chat'
      });
    }).catch(function (err) {
      if (err.error === 'services/chatkit/user_already_exists') {
        console.log("User already exists: ".concat(userId));
        return res.status(200).json({
          status: "success",
          message: 'user already exists'
        });
      } else {
        return res.status(500).json({
          status: "error",
          message: err
        });
      }
    });
  });
};

var authenticateUser = function authenticateUser(req, res) {
  var authData = chatkit.authenticate({
    userId: req.query.user_id
  });
  return res.status(200).json({
    "access_token": authData.body.access_token,
    "user_id": req.authUser['custom:_id'],
    "token_type": "access_token",
    "expires_in": authData.body.expires_in
  });
};

var _default = {
  addChatUser: addChatUser,
  authenticateUser: authenticateUser
};
exports.default = _default;
//# sourceMappingURL=chat.controller.js.map
