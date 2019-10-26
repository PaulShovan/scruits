"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bluebird = _interopRequireDefault(require("bluebird"));

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Notification Schema
 */
var NotificationSchema = new _mongoose.default.Schema({
  user_email: {
    type: String,
    required: true
  },
  notification_title: {
    type: String,
    required: true
  },
  notification_body: {
    type: String,
    required: true
  },
  notification_data: {
    notification_type: String,
    payload: String
  },
  status: {
    type: Number,
    required: true,
    default: 1
  }
});
/**
 * Statics
 */

NotificationSchema.statics = {
  /**
    * List notifications
    * @returns {Promise<Service[]>}
    */
  list: function list() {
    return this.find({
      status: 1
    }).exec();
  },
  updateNotificationStatus: function updateNotificationStatus(ids) {
    return this.where({
      notification_id: {
        $in: ids
      }
    }).setOptions({
      multi: true
    }).update({
      $set: {
        status: 2
      }
    }).exec();
  }
};
/**
 * @typedef Notification
 */

var _default = _mongoose.default.model('Notification', NotificationSchema);

exports.default = _default;
//# sourceMappingURL=notification.model.js.map
