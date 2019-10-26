import _ from 'underscore';
import Customer from '../models/customer.model';
import Service from '../models/service.model';
import ServiceItem from '../models/serviceItem.model';
import { roles } from '../helpers/constants';
import authCtrl from '../controllers/auth.controller';
import { upload } from '../services/s3.service';

const singleUpload = upload.single('image')

const add = (req, res, next) => {
  Customer.getByEmailOrPhone(req.body.email, req.body.phone)
    .then(result => {
      if(result){
        if(result.phone === req.body.phone){
          return res.status(400).json({
            message: 'Phone number already exists.'
          })
        } else {
          return res.status(400).json({
            message: 'Email already exists.'
          })
        }
      }
      const customer = new Customer({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        address: req.body.address,
        loc: {
          type: 'Point',
          coordinates: [req.body.lon, req.body.lat]
        },
        phone: req.body.phone,
        role: roles.customer
      });
      customer.save()
        .then(savedCustomer => {
          authCtrl.register({
            email: savedCustomer.email,
            password: req.body.password,
            user_id: savedCustomer.customer_id,
            _id: savedCustomer._id
          }, roles.customer)
            .then(result => res.status(200).json({
              status: "success",
              result: result
            }))
            .catch(e => res.status(500).json({
              status:"error",
              message:"Error adding customer"
          }));
        })
        .catch(e => res.status(500).json({
          status:"error",
          message:"Error adding customer"
      }));
    })
}

/**
 * update customer
 * @property {Object} req.body - Updated properties
 * @returns {Order}
 */
const update = (req, res, next) => {
  let customer = req.customer;
  if(req.body.lat && req.body.lon) {
    customer.loc = {
      type: 'Point',
      coordinates: [req.body.lon, req.body.lat]
    }
  }
  customer = _.extend(customer, req.body);
  customer.save()
    .then(savedCustomer => res.status(200).json({
      status: "success",
      result: savedCustomer
    }))
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error updating customer"
  }));
}

/**
 * update customer using token
 * @property {Object} req.body - Updated properties
 * @returns {Service}
 */
const updateCustomer = (req, res, next) => {
  Customer.get(req.authUser['custom:_id'])
    .then((customer) => {
      if(req.body.lat && req.body.lon) {
        customer.loc = {
          type: 'Point',
          coordinates: [req.body.lon, req.body.lat]
        }
      }
      customer = _.extend(customer, req.body);
      customer.save()
        .then(result => res.status(200).json({
          status: "success",
          result: result
        }))
        .catch(e => res.status(500).json({
          status:"error",
          message:"Error updating customer"
      }));
    })
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error updating customer"
  }));
}

const updateProfilePhoto = (req, res, next) => {
  singleUpload(req, res, function(err) {
    if (err) {
      return res.status(422).send({
        status:"error",
        message:'Image Upload Error'
      });
    }

    Customer.updatePhoto(req.authUser['custom:_id'], req.file.location)
      .then(updatedCustomer => {
        res.json({
          status: "success",
          result: {profile_photo: updatedCustomer.profile_photo}
        })
      })
      .catch(e => res.status(500).json({
        status:"error",
        message:"Error updating photo"
    }));
  });
}

const getNearbyPartners = (req, res, next) => {
  const { limit = 50, skip = 0 } = req.query;
  Customer.getById(req.authUser['custom:_id'])
    .then((customer) => {
      ServiceItem.find({
        loc: {
           $near: {
            $maxDistance: 1000 * customer.service_search_radius,
            $geometry: {
             type: "Point",
             coordinates: customer.loc.coordinates
            }
           }
          }
         }, 'partner')
         .skip(+skip)
         .limit(+limit)
         .populate({ path: 'partner', select: 'first_name last_name email phone address images', })
    
         .exec((error, results) => {
          if (error) {
            console.log(error);
            return res.status(500).json({
              status:"error",
              message: error
          });
          }
          // TODO Send notification to partners with order id for quotes
          return res.status(200).json({
            status: "success",
            result: results
          });
      });
    })
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error getting nearby partners"
  }));
}

const get = (req, res, next) => {
  const { limit = 50, skip = 0 } = req.query;
  Customer.list({ limit, skip })
    .then(customers => res.json({
      status: "success",
      result: customers
    }))
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error getting customers"
  }));
}

/**
 * Get customer
 * @returns {Customer}
 */
const getCustomer = (req, res) => {
  return res.status(200).json({
    status: "success",
    result: req.customer
  });
}

/**
 * Load customer and append to req.
 */
const loadCustomer = (req, res, next, customerId) => {
  Customer.get(customerId)
    .then((order) => {
      req.customer = order; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => res.status(500).json({
      status:"error",
      message:e
  }));
}

const profile = (req, res, next) => {
  Customer.getById(req.authUser['custom:_id'])
    .then(profile => {
      return res.status(200).json({
        status: "success",
        result: profile
      });
    })
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error loading profile"
  }));
}

const orders = (req, res, next) => {
  Customer.getOrders(req.authUser['custom:_id'])
    .then(orders => {
      return res.status(200).json({
        status: "success",
        result: orders
      });
    })
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error getting orders"
  }));
}

const getOrders = (req, res, next) => {
  Customer.getOrders(req.customer._id)
    .then(orders => {
      return res.status(200).json({
        status: "success",
        result: orders
      });
    })
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error getting orders"
  }));
}

export default {add, get, loadCustomer, getCustomer, update, profile, orders, updateProfilePhoto, getNearbyPartners, getOrders, updateCustomer}