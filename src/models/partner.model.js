import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import shortid from 'shortid';
import isEmail from 'validator/lib/isEmail';
import APIError from '../helpers/APIError';

/**
 * Partner Schema
 */
const PartnerSchema = new mongoose.Schema({
  partner_id: {
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
    street: String,
    city: String,
    state: String,
    country: String,
    zipcode: String
  },
  loc: {
    type: {type: String},
    coordinates: []
  },
  phone: String,
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  total_earned: {
    type: Number,
    default: 0
  },
  business_hours: {
    from: String,
    to: String
  },
  offers: [{
    offer_id: String,
    offer_details: String,
    offer_valid_from: Date,
    offer_valid_to: Date,
    offer_amount: Number
  }],
  quotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote'
  }],
  images: [],
  credits: {
    type: Number,
    default: 0
  },
  bio: String,
  services_radius: {
    type: Number,
    default: 10
  },
  can_goto_customer_location: {
    type: Boolean,
    default: false
  },
  reviews: [{
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    star: Number,
    description: String
  }],
  accociated_category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  accociated_services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  profile_photo: {
    type: String,
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
PartnerSchema.statics = {
  /**
   * List partners in descending order of 'createdAt' timestamp.
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
    return this.findOne({ _id: id }, 'first_name last_name email address loc phone business_hours images profile_photo credits bio reviews')
      .exec()
      .then((partner) => {
        if (partner) {
          partner.profile_photo = partner.profile_photo || ""
          return partner;
        }
        const err = new APIError('No such partner exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
  addToQuoteList(id, quote_id) {
    const update = {
      $push: {quotes:  mongoose.Types.ObjectId(quote_id)}
    }
    return this.findByIdAndUpdate(id, update, {new: true})
      .exec()
      .then((partner) => {
        return partner;
      })
  },
  getById(id) {
    return this.findOne({ _id: id }, 'first_name last_name email address phone business_hours images profile_photo credits bio loc accociated_category can_goto_customer_location services_radius')
      .exec()
      .then((partner) => {
        if (partner) {
          partner.accociated_category = partner.accociated_category || ""
          partner.profile_photo = partner.profile_photo || ""
          return partner;
        }
        const err = new APIError('No such profile exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
  getReviews(id) {
    return this.findOne({ _id: id }, 'reviews')
      .populate({ path: 'reviews.reviewed_by', select: 'first_name last_name profile_photo -_id', })
      .populate({ path: 'reviews.order', select: 'service -_id', })
      .exec()
      .then((partner) => {
        if (partner) {
          return partner;
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
      .exec().then(partner => {
        if (partner) {
          return partner
        } //user already exists with email AND/OR phone.
        else {
          return null
        } //no users with that email NOR phone exist.
      });
  },

  addReview(id, review) {
    return this.findOneAndUpdate({ _id: id }, { $push:{ reviews: review } }, {new: true})
    .exec()
    .then((partner) => {
      if (partner) {
        return partner;
      }
      const err = new APIError('No such partner exists!', httpStatus.NOT_FOUND);
      return Promise.reject(err);
    });
  },

  updateTotalEarned(id, value) {
    return this.findOneAndUpdate({ _id: id }, { $inc:{ total_earned: value } }, {new: true})
    .exec()
    .then((partner) => {
      if (partner) {
        return partner;
      }
      const err = new APIError('No such partner exists!', httpStatus.NOT_FOUND);
      return Promise.reject(err);
    });
  },

  updatePhoto(id, photo_urls) {
    return this.findByIdAndUpdate(id, { $addToSet: { images: { $each: photo_urls } } }, { new: true })
      .exec()
      .then((partner) => {
        if (partner) {
          return partner.images;
        }
        const err = new APIError('No such profile exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  updateProfilePhoto(id, photo_url) {
    return this.findByIdAndUpdate(id, { $set: { profile_photo: photo_url }}, { new: true })
      .exec()
      .then((partner) => {
        if (partner) {
          return partner;
        }
        const err = new APIError('No such profile exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  addOrder(id, order_id) {
    return this.findOneAndUpdate({ _id: id }, { $push:{ orders: order_id } }, {new: true})
    .exec()
    .then((partner) => {
      if (partner) {
        return partner;
      }
      const err = new APIError('No such partner exists!', httpStatus.NOT_FOUND);
      return Promise.reject(err);
    });
  },

  associateServices(id, services) {
    return this.findByIdAndUpdate(id, { $addToSet: { accociated_services: { $each: services } } }, { new: true })
      .exec()
      .then((partner) => {
        if (partner) {
          return partner;
        }
        const err = new APIError('No such profile exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  getAssociatedServices(id) {
    return this.findOne({ _id: id }, 'accociated_services')
      .populate({ path: 'accociated_services', select: 'name description image_url'})
      .exec()
      .then((services) => {
        if (services) {
          return services;
        }
        const err = new APIError('No such profile exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  removeAssociatedService(id, service) {
    return this.findOneAndUpdate({ _id: id }, { $pull:{ accociated_services: service } }, {new: true})
    .exec()
    .then((partner) => {
      if (partner) {
        return partner;
      }
      const err = new APIError('No such partner exists!', httpStatus.NOT_FOUND);
      return Promise.reject(err);
    });
  },

  getPartnerOrders(id) {
    return this.findOne({ _id: id }, 'orders')
      .populate({ path: 'orders',
        select: 'time_range service request_budget order_status order_schedule_date customer',
        populate: { path: 'customer', select: 'first_name last_name', } 
      })
      .exec()
      .then((orders) => {
        if (orders) {
          return orders.orders.sort( (a, b) => {
            return new Date(a.order_schedule_date) - new Date(b.order_schedule_date);
          });
        }
        const err = new APIError('No such profile exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Remove partners
   * @param {string[]} selectedPartnerIds - The array of profile_id.
   * @returns {Promise<Object, APIError>}
   */
  removeSelectedMembers(selectedPartnerIds) {
    return this.remove()
      .where('partner_id')
      .in(selectedPartnerIds)
      .exec();
  }
};

/**
 * @typedef Partner
 */
export default mongoose.model('Partner', PartnerSchema);