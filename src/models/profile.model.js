import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import shortid from 'shortid';
import isEmail from 'validator/lib/isEmail';
import APIError from '../helpers/APIError';

/**
 * Profile Schema
 */
const ProfileSchema = new mongoose.Schema({
  profile_id: {
    type: String,
    required: true,
    default: shortid.generate
  },
  first_name: {
    type: String
  },
  last_name: {
    type: String
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate: [isEmail, 'Please fill a valid email address']
  },
  address: {
    street: {
      type: String  
    },
    city: {
      type: String  
    },
    state: {
      type: String  
    },
    country: {
      type: String  
    }
  },
  phone: {
    type: String
  },
  number_of_orders: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    required: true
  },
});

/**
 * Statics
 */
ProfileSchema.statics = {
  /**
   * List members in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of profiles to be skipped.
   * @param {number} limit - Limit profiles to be returned.
   * @returns {Promise<Profile[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  },
  
  get(id) {
    return this.findOne({ profile_id: id })
      .exec()
      .then((profile) => {
        if (profile) {
          return profile;
        }
        const err = new APIError('No such profile exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
  /**
   * Remove profiles
   * @param {string[]} selectedProfileIds - The array of profile_id.
   * @returns {Promise<Object, APIError>}
   */
  removeSelectedMembers(selectedProfileIds) {
    return this.remove()
      .where('profile_id')
      .in(selectedProfileIds)
      .exec();
  }
};

/**
 * @typedef Profile
 */
export default mongoose.model('Profile', ProfileSchema);