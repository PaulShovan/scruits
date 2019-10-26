import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import shortid from 'shortid';
import APIError from '../helpers/APIError';

/**
 * Quote Schema
 */
const QuoteSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  quote_partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner'
  },
  quote_explanation: {
    type: String,
    required: true,
  },
  service_address: {
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
  service_location: {
    type: {
      type: String  
    },
    coordinates: {
      type: Array  
    }
  },
  price: {
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'CAD'
    }
  },
  quote_create_time: {
    type: Date,
    default: Date.now
  },
  quote_status: {
    type: Number,
    default: 1
  }
});

/**
 * Statics
 */
QuoteSchema.statics = {
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
      .then((quote) => {
        if (quote) {
          return quote;
        }
        const err = new APIError('No such order exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  getQuoteFull(id) {
    return this.findOne({ _id: id })
      .populate('customer')
      .exec()
      .then((order) => {
        if (order) {
          return order;
        }
        const err = new APIError('No such order exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  acceptQuote(id) {
    return this.findOneAndUpdate({ _id: id }, { $set:{ quote_status: 2 } }, {new: true})
      .exec()
      .then((quote) => {
        if (quote) {
          return quote;
        }
        const err = new APIError('No such quote exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  rejectQuote(id) {
    return this.findOneAndUpdate({ _id: id }, { $set:{ quote_status: 3 } }, {new: true})
      .exec()
      .then((quote) => {
        if (quote) {
          return quote;
        }
        const err = new APIError('No such quote exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
  /**
   * Remove orders
   * @param {string[]} selectedOrderIds - The array of profile_id.
   * @returns {Promise<Object, APIError>}
   */
  removeSelectedMembers(selectedOrderIds) {
    return this.remove()
      .where('order_id')
      .in(selectedOrderIds)
      .exec();
  }
};

/**
 * @typedef Order
 */
export default mongoose.model('Quote', QuoteSchema);