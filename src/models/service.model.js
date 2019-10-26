import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * Service Schema
 */
const ServiceSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image_url: {
    type: String
  },
  status: {
    type: Number,
    default: 1
  }
});

/**
 * Statics
 */
ServiceSchema.statics = {
    /**
     * List services
     * @param {number} skip - Number of services to be skipped.
     * @param {number} limit - Limit services to be returned.
     * @returns {Promise<Service[]>}
     */
    getServices({ skip = 0, limit = 50, status = 1 } = {}) {
      return this.find({status: status})
        .skip(+skip)
        .limit(+limit)
        .populate({ path: 'category', select: 'name image_url', })
        .exec();
    },

    getServicesByCategory(categoryId) {
      return this.find({category: categoryId})
        .populate({ path: 'category', select: 'name image_url', })
        .exec();
    },
   
   /**
   * Get service
   * @param {String} serviceId - The id of service.
   * @returns {Promise<Service, APIError>}
   */
  get(serviceId) {
    return this.findOne({ _id: serviceId })
      .populate({ path: 'category', select: 'name image_url', })
      .exec()
      .then((service) => {
        if (service) {
          return service;
        }
        const err = new APIError('No such service exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
  
  getMatchedServices(limit, skip, serviceMatchString) {
    return this.find({ "name": { $regex: serviceMatchString, $options : "i" } }, 'name description image_url')
      .skip(+skip)
      .limit(+limit)
      .exec()
      .then(services => services)
  },

  updateServicePhoto(id, photo_url) {
    return this.findOneAndUpdate({ _id: id }, { $set: { image_url: photo_url }}, { new: true })
      .exec()
      .then((service) => {
        if (service) {
          return service;
        }
        const err = new APIError('No such profile exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
}
/**
 * @typedef Service
 */
export default mongoose.model('Service', ServiceSchema);