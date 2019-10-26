"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.runSendNotification = exports.saveNotificaton = void 0;

var _notification = _interopRequireDefault(require("../models/notification.model"));

var _device = _interopRequireDefault(require("../models/device.model"));

var _androidNotification = require("../services/android.notification.service");

var _iosNotification = require("../services/ios.notification.service");

var _email = _interopRequireDefault(require("../services/email.service"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var interval = function interval(func, wait, times) {
  var interv = function (w, t) {
    return function () {
      if (typeof t === "undefined" || t-- > 0) {
        setTimeout(interv, w);

        try {
          func.call(null);
        } catch (e) {
          t = 0;
          throw e.toString();
        }
      }
    };
  }(wait, times);

  setTimeout(interv, wait);
};

var saveNotificaton = function saveNotificaton(email, title, body) {
  var notification = new _notification.default({
    user_email: email,
    notification_title: title,
    notification_body: body
  });
  notification.save().then(function (res) {
    console.log('Notification saved');
  });
};

exports.saveNotificaton = saveNotificaton;

var updateNotifications = function updateNotifications(ids) {
  _notification.default.updateNotificationStatus(ids).then(function (res) {
    console.log('status updated');
  });
};

var sendNotifications = function sendNotifications() {
  _notification.default.list().then(function (notifications) {
    if (!notifications || notifications.length <= 0) {
      return;
    }

    notifications.forEach(function (element) {
      _device.default.get(element.user_email).then(function (res) {
        if (!res) {
          return;
        }

        if (res.platform === 'ios') {
          (0, _iosNotification.sendIos)(res.device_id, element).then(function (ack) {
            updateNotifications([element.notification_id]);
          });
        } else {
          (0, _androidNotification.sendAndroid)([res.device_id], element).then(function (ack) {
            updateNotifications([element.notification_id]);
          });
        }

        (0, _email.default)('noreply@scruits.com', element.user_email, element.notification_title, element.notification_body);
        updateNotifications([element.notification_id]);
      });
    });
  });
};

var runSendNotification = function runSendNotification() {
  interval(function () {
    return sendNotifications();
  }, 5000);
};

exports.runSendNotification = runSendNotification;
//# sourceMappingURL=notification.service.js.map
