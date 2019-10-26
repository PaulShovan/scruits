import _ from 'underscore';
import Service from '../models/service.model';
import { upload } from '../services/s3.service';

const singleUpload = upload.single('image')

const add = (req, res, next) => {
  const service = new Service({
    category: req.body.categoryId,
    name: req.body.name,
    status: req.authUser['custom:role'] === 'admin' ? 1 : 2,
    description: req.body.description,
  });
  service.save()
    .then(savedService => res.status(200).json({
      status: "success",
      result: savedService
    }))
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error adding service"
  }));
}

const updateServicePhoto = (req, res, next) => {
  singleUpload(req, res, function(err) {
    if (err) {
      return res.status(422).send({
        status:"error",
        message:'Image Upload Error'
      });
    }

    Service.updateServicePhoto(req.service._id, req.file.location)
      .then(updated => {
        res.status(200).json({
          status: "success",
          result: { image_url: updated.image_url }
        })
      })
      .catch(e => res.status(500).json({
        status:"error",
        message:"Error updating service photo"
    }));
  });
}

const getServices = (req, res, next) => {
  const { limit = 50, skip = 0, status = 1 } = req.query;
  Service.getServices({ limit, skip, status })
    .then(services => res.json({
      status: "success",
      result: services
    }))
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error getting services"
  }));
}

const getMatchedServices = (req, res, next) => {
  const { limit = 50, skip = 0, text = '' } = req.query;
  Service.getMatchedServices(limit, skip, text)
    .then(services =>{
      if(req.authUser['custom:role'] !== 'admin') {
        services = services.filter(s => s.status === 1)
      }
      return res.json({
        status: "success",
        result: services
      })
    })
    .catch(e => res.status(500).json({
      status:"error",
      // message:"Error getting services"
      message: e
  }));
}

const loadServiceByCategory = (req, res, next, categoryId) => {
  Service.getServicesByCategory(categoryId)
    .then((services) => {
      req.services = services; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error loading service"
  }));
}

const getServiceByCategory = (req, res) => {
  let services = req.services;
  if(req.query.status) {
    services = req.services.filter(s => s.status == (req.query.status))
  }
  return res.json({
    status: "success",
    result: services
  });
}

/**
 * update service
 * @property {Object} req.body - Updated properties
 * @returns {Service}
 */
const update = (req, res, next) => {
    let service = req.service;
    service = _.extend(service, req.body);
    service.save()
      .then(savedservice => res.json({
        status: "success",
        result: savedservice
      }))
      .catch(e => res.status(500).json({
        status:"error",
        message:"Error updating service"
    }));
  }

/**
 * Get service
 * @returns {Service}
 */
const getService = (req, res) => {
  return res.json({
    status: "success",
    result: req.service
  });
}
/**
 * Load service and append to req.
 */
const load = (req, res, next, serviceId) => {
    Service.get(serviceId)
      .then((service) => {
        req.service = service; // eslint-disable-line no-param-reassign
        return next();
      })
      .catch(e => res.status(500).json({
        status:"error",
        message:"Error loading service"
    }));
  }

export default {add, load, getService, update, getServices, updateServicePhoto, loadServiceByCategory, getServiceByCategory, getMatchedServices}