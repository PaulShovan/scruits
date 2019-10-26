"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendIos = void 0;

var _apn = _interopRequireDefault(require("apn"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var options = {
  token: {
    key: 'src/services/AuthKey_FYJRK4QLU8.p8',
    keyId: "FYJRK4QLU8",
    teamId: "63632B255F"
  },
  production: false
};
var apnProvider = new _apn.default.Provider(options);

var sendIos = function sendIos(device, notification) {
  var note = new _apn.default.Notification();
  note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.

  note.sound = "ping.aiff";
  note.alert = notification.title;
  note.payload = {
    'message': notification.notification_body,
    'data': notification.notification_data
  };
  return new Promise(function (resolve, reject) {
    apnProvider.send(note, device).then(function (result) {
      resolve(result);
    });
  });
};

exports.sendIos = sendIos;
//# sourceMappingURL=ios.notification.service.js.map
