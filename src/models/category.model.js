import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * Category Schema
 */
const CategorySchema = new mongoose.Schema({
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
CategorySchema.statics = {
  /**
   * @param {number} skip - Number of ServiceType to be skipped.
   * @param {number} limit - Limit ServiceType to be returned.
   * @returns {Promise<ServiceType[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .skip(+skip)
      .limit(+limit)
      .exec();
  },
  
  get(id) {
    return this.findOne({ _id: id })
      .exec()
      .then((category) => {
        if (category) {
          return category;
        }
        const err = new APIError('No such service type exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  // getSubCategory(id) {
  //   return this.findOne({ 'sub_categories._id': id })
  //     .exec()
  //     .then((serviceType) => {
  //       if (serviceType) {
  //         return serviceType;
  //       }
  //       const err = new APIError('No such service type exists!', httpStatus.NOT_FOUND);
  //       return Promise.reject(err);
  //     });
  // },

  // getMatchedTypes(serviceMatchString) {
  //   return this.find({'$or': [{ "name": { "$regex": serviceMatchString, "$options": "i" } },
  //   { "sub_categories.name": { "$regex": serviceMatchString, "$options": "i" } }]})
  //     .exec()
  //     .then(serviceTypes => serviceTypes)

  // },

  // addSubCategory(categoryId, subCategory) {
  //   return this.findOneAndUpdate({ _id: categoryId }, { $push: { sub_categories: subCategory } }, { new: true })
  //     .exec()
  //     .then((category) => {
  //       if (category) {
  //         return category;
  //       }
  //       const err = new APIError('No such profile exists!', httpStatus.NOT_FOUND);
  //       return Promise.reject(err);
  //     });
  // },

  updateCategoryPhoto(id, photo_url) {
    return this.findOneAndUpdate({ _id: id }, { $set: { image_url: photo_url }}, { new: true })
      .exec()
      .then((category) => {
        if (category) {
          return category;
        }
        const err = new APIError('No such profile exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
};

/**
 * @typedef ServiceType
 */
export default mongoose.model('Category', CategorySchema);