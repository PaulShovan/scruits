import Promise from 'bluebird';
import mongoose from 'mongoose';
import APIError from '../helpers/APIError';

/**
 * Device Schema
 */
const DeviceSchema = new mongoose.Schema({
  user_email: {
    type: String,
    required: true,
  },  
  device_id: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    required: true
  },
  status: {
    type: Number,
    required: true,
    default: 1
  },
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
  get(userEmail) {
    return this.findOne({ user_email: userEmail })
      .exec()
      .then((device) => {
        if (device) {
          return device;
        }
        return null;
      });
  },
}
/**
 * @typedef Device
 */
export default mongoose.model('Device', DeviceSchema);