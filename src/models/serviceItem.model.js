import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * Service Item Schema
 */
const ServiceItemSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner'
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
  },
  image_url: {
    type: String
  },
  loc: {
    type: {type: String, select: false,},
    coordinates: {type: Array, select: false},
    select: false,
  },
  status: {
    type: Number,
    default: 1
  }
});

/**
 * Statics
 */
ServiceItemSchema.statics = {
    /**
     * List services
     * @param {number} skip - Number of services to be skipped.
     * @param {number} limit - Limit services to be returned.
     * @returns {Promise<Service[]>}
     */
    getServiceItems({ skip = 0, limit = 50, status = 1 } = {}) {
      return this.find({status: status}, 'name price description image_url partner')
        .skip(+skip)
        .limit(+limit)
        .populate({ path: 'partner', select: 'name', })
        .exec();
    },

    getServiceItemsByService(serviceId) {
      return this.find({service: serviceId}, 'name price description image_url partner')
        .populate({ path: 'partner', select: 'name', })
        .exec();
    },

    getServiceItemsByPartner(partnerId) {
        return this.find({partner: partnerId}, 'name price description image_url')
          .exec();
      },
    
    getPartnerServiceItemsByServiceId(partnerId, serviceId) {
        return this.find({partner: partnerId, service: serviceId}, 'name price description image_url')
          .exec();
      },

    getServices(partnerId) {
        return this.find({partner: partnerId}, 'service')
          .populate({ path: 'service', select: 'name description'})
          .exec();
      },
   
   /**
   * Get service
   * @param {String} serviceId - The id of service.
   * @returns {Promise<Service, APIError>}
   */
  get(serviceItemId) {
    return this.findOne({ _id: serviceItemId }, 'name price description image_url partner')
    .populate({ path: 'partner', select: 'name', })
      .exec()
      .then((service) => {
        if (service) {
          return service;
        }
        const err = new APIError('No such service exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
  
  getMatchedServiceItems(serviceMatchString) {
    return this.find({ "name": { "$regex": serviceMatchString, "$options": "i" }, status: 1 }, 'name price description image_url')
      .exec()
      .then(services => services)
  },

  updateServiceItemPhoto(id, photo_url) {
    return this.findOneAndUpdate({ _id: id }, { $set: { image_url: photo_url }}, { new: true })
      .exec()
      .then((serviceItem) => {
        if (serviceItem) {
          return serviceItem;
        }
        const err = new APIError('No such service item exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
  updateLocationOfServiceItem(id, location) {
    return this.update({ partner: id }, { $set: { loc: location }}, {'multi': true})
      .exec()
      .then((serviceItem) => {
        if (serviceItem) {
          return serviceItem;
        }
        const err = new APIError('No such service item exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
  removeServiceItemById(serviceItemId) {
    return this.findOneAndRemove({ _id: serviceItemId })
      .exec()
      .then((serviceItem) => {
        if (serviceItem) {
          return serviceItem;
        }
        const err = new APIError('No such service item exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
  removeServiceItemByServiceAndPartnerId(service, partner) {
    return this.deleteMany({ service: service, partner: partner })
      .exec()
      .then((serviceItem) => {
        if (serviceItem) {
          return serviceItem;
        }
        const err = new APIError('No such service item exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  }
}
/**
 * @typedef ServiceItem
 */
export default mongoose.model('ServiceItem', ServiceItemSchema);