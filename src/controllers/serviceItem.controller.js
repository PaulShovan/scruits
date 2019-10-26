import _ from 'underscore';
import ServiceItem from '../models/serviceItem.model';
import Partner from '../models/partner.model';
import { upload } from '../services/s3.service';

const singleUpload = upload.single('image')

const add = (req, res, next) => {
  Partner.getById(req.authUser['custom:_id'])
    .then(partner => {
      const serviceItem = new ServiceItem({
        service: req.body.serviceId,
        partner: req.authUser['custom:_id'],
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        loc: partner.loc
      });
      
      serviceItem.save()
        .then(savedServiceItem => {
          return res.json({
            status: "success",
            result: {
              status: savedServiceItem.status,
              _id: savedServiceItem._id,
              service: savedServiceItem.service,
              partner: savedServiceItem.partner,
              name: savedServiceItem.name,
              price: savedServiceItem.price,
              description: savedServiceItem.description
            }
          })
        })
        .catch(e => res.status(500).json({
            status:"error",
            message:"Error adding service item"
        }));
    })
}

const updateServiceItemPhoto = (req, res, next) => {
  singleUpload(req, res, function(err) {
    if (err) {
      return res.status(422).send({errors: [{title: 'Image Upload Error', detail: err.message}]});
    }

    ServiceItem.updateServiceItemPhoto(req.serviceItem._id, req.file.location)
      .then(updated => {
        res.json({
          status: "success",
          result: { image_url: updated.image_url }
        })
      })
      .catch(e => res.status(500).json({
        status:"error",
        message:"Error updating service item photo"
    }));
  });
}

const getServiceItems = (req, res, next) => {
  const { limit = 50, skip = 0, status = 1 } = req.query;
  ServiceItem.getServiceItems({ limit, skip, status })
    .then(services => res.json({
        status: "success",
        result: services
      }))
      .catch(e => res.status(500).json({
        status:"error",
        message:"Error getting service items"
    }));
}

const loadServiceItemsByServiceId = (req, res, next, serviceId) => {
  ServiceItem.getServiceItemsByService(serviceId)
    .then((services) => {
      req.serviceId = serviceId;
      req.serviceItems = services; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => res.status(500).json({
        status:"error",
        message:"Error getting service items"
    }));
}

const loadServiceItemsByPartnerId = (req, res, next, partnerId) => {
    ServiceItem.getServiceItemsByPartner(partnerId)
      .then((services) => { 
        req.serviceItems = services; // eslint-disable-line no-param-reassign
        return next();
      })
      .catch(e => res.status(500).json({
          status:"error",
          message:"Error getting service items"
      }));
  }

const getServiceItemsByServiceId = (req, res) => {
  return res.status(200).json({
    status: "success",
    result: req.serviceItems
  });
}

const getServiceItemsByPartnerId = (req, res) => {
    return res.status(200).json({
      status: "success",
      result: req.serviceItems
    });
  }

const getServiceItemsById = (req, res) => {
    return res.status(200).json({
      status: "success",
      result: req.serviceItem
    });
  }

/**
 * update service
 * @property {Object} req.body - Updated properties
 * @returns {Service}
 */
const update = (req, res, next) => {
    let serviceItem = req.serviceItem;
    serviceItem = _.extend(serviceItem, req.body);
    serviceItem.save()
      .then(savedservice => res.json({
        status: "success",
        result: savedservice 
      }))
      .catch(e => res.status(500).json({
        status:"error",
        message:"Error updating service item"
    }));
  }

  const deleteServiceItem = (req, res, next) => {
    ServiceItem.removeServiceItemById(req.serviceItem._id)
      .then(result => res.json({
        status: "success",
        result: 'Item has been removed'
      }))
      .catch(e => res.status(500).json({
        status:"error",
        message:"Error removing service items"
    }));
  }

  const removeServiceItemByServiceAndPartnerId = (req, res) => {
    ServiceItem.removeServiceItemByServiceAndPartnerId(req.serviceId, req.authUser['custom:_id'])
      .then(result => {
        Partner.removeAssociatedService(req.authUser['custom:_id'], req.serviceId)
          .then(partner =>  res.json({
            status: "success",
            result: 'Items has been removed'
          }))
      })
      .catch(e => res.status(500).json({
        status:"error",
        message:"Error removing service items"
    }));
  }


/**
 * Load service and append to req.
 */
const load = (req, res, next, serviceId) => {
    ServiceItem.get(serviceId)
      .then((serviceItem) => {
        req.serviceItem = serviceItem; // eslint-disable-line no-param-reassign
        return next();
      })
      .catch(e => next(e));
  }

export default {add, load, update, getServiceItems, updateServiceItemPhoto, loadServiceItemsByPartnerId, loadServiceItemsByServiceId, getServiceItemsByPartnerId, getServiceItemsByServiceId, getServiceItemsById, deleteServiceItem, removeServiceItemByServiceAndPartnerId}