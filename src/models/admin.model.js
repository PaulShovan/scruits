import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import shortid from 'shortid';
import isEmail from 'validator/lib/isEmail';
import APIError from '../helpers/APIError';

/**
 * Customer Schema
 */
const AdminSchema = new mongoose.Schema({
  admin_id: {
    type: String,
    required: true,
    default: shortid.generate
  },
  name: {
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
});

/**
 * Statics
 */
AdminSchema.statics = {
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
    return this.findOne({ _id: id })
      .exec()
      .then((customer) => {
        if (customer) {
          return customer;
        }
        const err = new APIError('No such profile exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  getByEmailOrPhone(email, phone) {
    return this.findOne({$or: [
        {email: email},
        {phone: phone}
    ]})
      .exec().then(customer => {
        if (customer) {
          return customer
        } //user already exists with email AND/OR phone.
        else {
          return null
        } //no users with that email NOR phone exist.
      });
  },

  /**
   * Remove customers
   * @param {string[]} selectedCustomerIds - The array of customer_id.
   * @returns {Promise<Object, APIError>}
   */
  removeSelectedMembers(selectedCustomerIds) {
    return this.remove()
      .where('customer_id')
      .in(selectedCustomerIds)
      .exec();
  }
};

/**
 * @typedef Admin
 */
export default mongoose.model('Admin', AdminSchema);