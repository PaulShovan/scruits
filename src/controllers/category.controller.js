import _ from 'underscore';
import Category from '../models/category.model';
import { upload } from '../services/s3.service';

const singleUpload = upload.single('image')

const add = (req, res, next) => {
  const category = new Category({
    name: req.body.name,
    description: req.body.description
  });
  category.save()
    .then(savedCategory => {
      res.status(200).json({
        status: "success",
        result: savedCategory
      })
    })
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error adding category"
  }));
}

// const addSubCategory = (req, res, next) => {
//   const subCategory = {
//     name: req.body.name,
//     description: req.body.description,
//     status: req.authUser['custom:role'] === 'admin' ? 1 : 2
//   };
//   Category.addSubCategory(req.category._id, subCategory)
//     .then(savedCategory => {
//       res.status(200).json(savedCategory)
//     })
//     .catch(e => res.status(500).json(e))
// }

/**
 * Get ServiceType
 * @returns {Category}
 */
const getCategory = (req, res) => {
  return res.status(200).json({
    status: "success",
    result: req.category
  });
}

/**
 * Load service type and append to req.
 */
const loadCategory = (req, res, next, categoryId) => {
    Category.get(categoryId)
      .then((category) => {
        req.category = category; // eslint-disable-line no-param-reassign
        return next();
      })
      .catch(e => res.status(500).json({
        status:"error",
        message:"Error loading category"
    }));
  }

/**
 * update ServiceType
 * @property {Object} req.body - Updated properties
 * @returns {Order}
 */
const update = (req, res, next) => {
    let category = req.category;
    category = _.extend(category, req.body);
    category.save()
      .then(savedCategory => res.status(200).json({
        status: "success",
        result: savedCategory
      }))
      .catch(e => res.status(500).json({
        status:"error",
        message:"Error updating category"
    }));
  }

const getAll = (req, res, next) => {
  const { limit = 50, skip = 0 } = req.query;
  Category.list({ limit, skip })
    .then(categories => res.json({
      status: "success",
      result: categories
    }))
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error getting categories"
  }));
}

// const getMatchedTypes = (req, res, next, service) => {
//   ServiceType.getMatchedTypes(service)
//     .then(serviceTypes => {
//       req.serviceTypes = serviceTypes; // eslint-disable-line no-param-reassign
//       return next();
//     })
//     .catch(e => next(e));
// }

// const getMatchedFoundTypes = (req, res) => {
//   return res.status(200).json(req.serviceTypes);
// }

const updateCategoryPhoto = (req, res, next) => {
  singleUpload(req, res, function(err) {
    if (err) {
      return res.status(422).send({errors: [{title: 'Image Upload Error', detail: err.message}]});
    }

    Category.updateCategoryPhoto(req.category._id, req.file.location)
      .then(updated => {
        res.json({
          status: "success",
          result: { image_url: updated.image_url }
        })
      })
      .catch(e => res.status(500).json({
        status:"error",
        message:"Error updating category photo"
    }));
  });
}

// const loadSubCategory = (req, res, next, subCategoryId) => {
//   ServiceType.getSubCategory(subCategoryId)
//     .then((serviceSubCategory) => {
//       req.serviceSubCategory = serviceSubCategory; // eslint-disable-line no-param-reassign
//       return next();
//     })
//     .catch(e => next(e));
// }

// const getSubCategory = (req, res) => {
//   return res.status(200).json(req.serviceSubCategory);
// }

export default { add, getCategory, loadCategory, update, getAll, updateCategoryPhoto }