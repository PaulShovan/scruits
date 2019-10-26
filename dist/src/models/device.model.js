"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bluebird = _interopRequireDefault(require("bluebird"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _APIError = _interopRequireDefault(require("../helpers/APIError"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Device Schema
 */
var DeviceSchema = new _mongoose.default.Schema({
  user_email: {
    type: String,
    required: true
  },
  device_id: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true
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

DeviceSchema.statics = {
  /**
  * Get device
  * @param {String} userEmail - The email of user.
  * @returns {Promise<Device, APIError>}
  */
  get: function get(userEmail) {
    return this.findOne({
      user_email: userEmail
    }).exec().then(function (device) {
      if (device) {
        return device;
      }

      return null;
    });
  }
};
/**
 * @typedef Device
 */

var _default = _mongoose.default.model('Device', DeviceSchema);

exports.default = _default;
//# sourceMappingURL=device.model.js.map
