import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import shortid from 'shortid';
import isEmail from 'validator/lib/isEmail';
import APIError from '../helpers/APIError';

/**
 * Customer Schema
 */
const CustomerSchema = new mongoose.Schema({
  customer_id: {
    type: String,
    required: true,
    default: shortid.generate
  },
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
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
    },
    zipcode: {
      type: String
    }
  },
  loc: {
    type: {
      type: String  
    },
    coordinates: {
      type: Array  
    }
  },
  phone: {
    type: String
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  hired_partners: {
    type: Number  
  },
  total_points: {
    type: Number,
    default: 0  
  },
  total_orders: {
    type: Number,
    default: 0  
  },
  service_search_radius: {
    type: Number,
    default: 10
  },
  member_since: {
    type: Date,
    default: Date.now
  },
  profile_photo: {
    type: String,
  },
  role: {
    type: String,
    required: true
  },
});

/**
 * Statics
 */
CustomerSchema.statics = {
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
  
  addToOrderList(id, order_id) {
    const update = {
      $push: {orders:  mongoose.Types.ObjectId(order_id)}
    }
    return this.findByIdAndUpdate(id, update, {new: true})
      .exec()
      .then((order) => {
        return order;
      })
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

  getById(id) {
    return this.findOne({ _id: id }, 'customer_id first_name last_name email address loc phone total_points service_search_radius member_since profile_photo')
      .exec()
      .then((customer) => {
        if (customer) {
          return customer;
        }
        const err = new APIError('No such profile exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  getOrders(id) {
    return this.findOne({ _id: id }, 'orders')
      .populate('orders')
      .exec()
      .then((customer) => {
        if (customer) {
          if(customer.orders.length <= 0) {
            return []
          }
          return customer.orders.sort( (a, b) => {
            return new Date(a.order_schedule_date) - new Date(b.order_schedule_date);
          });
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

  updatePhoto(id, photo_url) {
    return this.findByIdAndUpdate(id, { $set: { profile_photo: photo_url }}, { new: true })
      .exec()
      .then((customer) => {
        if (customer) {
          return customer;
        }
        const err = new APIError('No such profile exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  updateNumOfOrders(id) {
    return this.findOneAndUpdate({ _id: id }, { $inc:{ total_orders: 1 } }, {new: true})
    .exec()
    .then((customer) => {
      if (customer) {
        return customer;
      }
      const err = new APIError('No such partner exists!', httpStatus.NOT_FOUND);
      return Promise.reject(err);
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
 * @typedef Customer
 */
export default mongoose.model('Customer', CustomerSchema);