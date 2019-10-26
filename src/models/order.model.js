import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * Order Schema
 */
const OrderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  order_create_time: {
    type: Date,
    default: Date.now
  },
  order_schedule_date: {
    type: Date,
    default: Date.now
  },
  time_range: {
    start: {
      type: String
    },
    end: {
      type: String  
    }  
  },
  service: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    },
    name: {
      type: String
    },
    request_message: {
      type: String
    }
  },
  request_budget: {
    min: {
      type: Number  
    },
    max: {
      type: Number  
    }  
  },
  payment_details: {
    transaction_id: String,
    amount: Number,
    currency: {
      type: String,
      default: 'CAD'
    },
    payment_type: String,
    status: {
      type: Number,
      default: 1
    }
  },
  quotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote'
  }],
  appointed_partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner'
  },
  appointed_price: {
    amount: {
      type: Number
    },
    currency: {
      type: String
    }
  },
  order_status: {
    type: Number,
    default: 1
  },
  partners_to_quote: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner'
  }],
  partners_quoted: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner'
  }],
  rejected_partners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner'
  }],
});

/**
 * Statics
 */
OrderSchema.statics = {
  /**
   * List members in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of profiles to be skipped.
   * @param {number} limit - Limit profiles to be returned.
   * @returns {Promise<Profile[]>}
   */
  list({ skip = 0, limit = 50, status = 1 } = {}) {
    return this.find({ order_status: status })
      .sort({ order_schedule_date: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  },
  
  get(id) {
    return this.findOne({ _id: id })
      .exec()
      .then((order) => {
        if (order) {
          return order;
        }
        const err = new APIError('No such order exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  getOrderFull(id) {
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

  addToQuoteList(id, quote_id, partner_id) {
    console.log(partner_id);
    const update = {
      $push: {quotes:  mongoose.Types.ObjectId(quote_id), partners_quoted: partner_id}
    }
    return this.findByIdAndUpdate(id, update, {new: true})
      .exec()
      .then((quote) => {
        return quote;
      })
  },

  addToPartnerToQuoteList(id, partners) {
    return this.findByIdAndUpdate(id, { $addToSet: { partners_to_quote: { $each: partners } } }, { new: true })
      .exec()
      .then((order) => {
        if (order) {
          return order;
        }
        const err = new APIError('No such profile exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  removeFromPartnerToQuoteList(id, partner) {
    return this.findOneAndUpdate({ _id: id }, { $pull:{ partners_to_quote: partner } }, {new: true})
    .exec()
    .then((order) => {
      if (order) {
        return order;
      }
      const err = new APIError('No such order exists!', httpStatus.NOT_FOUND);
      return Promise.reject(err);
    });
  },

  addToRejectedPartnerList(id, partner, quote) {
    return this.findByIdAndUpdate(id, { $addToSet: { rejected_partners: partner }, $pull: {quotes: quote} }, { new: true })
      .exec()
      .then((order) => {
        if (order) {
          return order;
        }
        const err = new APIError('No such profile exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  getQuotes(id) {
    return this.findOne({ _id: id }, 'quotes')
      .populate({
        path: 'quotes',
        populate: { path: 'quote_partner', select: 'first_name last_name profile_photo' }
      })
      .exec()
      .then((quotes) => {
        if (quotes) {
          return quotes;
        }
        const err = new APIError('No such order exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
  updatePayment(id, payment) {
    return this.findOneAndUpdate({ _id: id }, { $set:{ payment_details: payment, order_status: 3 } }, {new: true})
    .exec()
    .then((order) => {
      if (order) {
        return order;
      }
      const err = new APIError('No such order exists!', httpStatus.NOT_FOUND);
      return Promise.reject(err);
    });
  },
  updateAppointedPartner(id, partner, price) {
    return this.findOneAndUpdate({ _id: id }, { $set:{ appointed_partner: partner, order_status: 2, appointed_price: price } }, {new: true})
    .exec()
    .then((order) => {
      if (order) {
        return order;
      }
      const err = new APIError('No such order exists!', httpStatus.NOT_FOUND);
      return Promise.reject(err);
    });
  },

  lockOrderForQuote(id) {
    return this.findOneAndUpdate({ _id: id }, { $set:{ order_status: 4 } }, {new: true})
    .exec()
    .then((order) => {
      if (order) {
        return order;
      }
      const err = new APIError('No such order exists!', httpStatus.NOT_FOUND);
      return Promise.reject(err);
    });
  },

  unlockOrderForQuote(id) {
    return this.findOneAndUpdate({ _id: id }, { $set:{ order_status: 1 } }, {new: true})
    .exec()
    .then((order) => {
      if (order) {
        return order;
      }
      const err = new APIError('No such order exists!', httpStatus.NOT_FOUND);
      return Promise.reject(err);
    });
  },

  getOrdersForPartnerToQuote(skip, limit, partner) {
    return this.find({$and: [{ partners_to_quote: partner},
      { order_status: { $nin: [4, 5] }},
      { appointed_partner: { $exists: false } },
      { rejected_partners: { "$ne": partner } },
      { partners_quoted: { "$ne": partner } } ]},
      'service customer order_schedule_date time_range payment_details request_budget')
      .sort({ order_schedule_date: -1 })
      .skip(+skip)
      .limit(+limit)
      .populate({path: 'customer', select: 'first_name last_name'})
      .exec();
  },

  getOngoingOrders(skip, limit, partner) {
    return this.find({$and: [{ partners_to_quote: partner}, { partners_quoted: { "$eq": partner } }, { order_status: { $nin: [3, 5] }}, { rejected_partners: { "$ne": partner } } ]}, 'service customer order_schedule_date time_range appointed_price')
      .sort({ order_schedule_date: -1 })
      .skip(+skip)
      .limit(+limit)
      .populate({path: 'customer', select: 'first_name last_name address phone profile_photo'})
      .populate({path: 'quotes', select: 'quote_partner'})
      .exec();
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
export default mongoose.model('Order', OrderSchema);