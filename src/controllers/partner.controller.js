import _ from 'underscore';
import Partner from '../models/partner.model';
import Service from '../models/service.model';
import ServiceItem from '../models/serviceItem.model';
import Order from '../models/order.model';
import { roles } from '../helpers/constants';
import authCtrl from '../controllers/auth.controller';
import { upload } from '../services/s3.service';

const multipleUpload = upload.array('images');
const singleUpload = upload.single('image')

const add = (req, res, next) => {
  Partner.getByEmailOrPhone(req.body.email, req.body.phone)
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
      const partner = new Partner({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        address: req.body.address,
        loc: {
          type: 'Point',
          coordinates: [req.body.lon, req.body.lat]
        },
        phone: req.body.phone,
        role: roles.partner,
        business_hours: req.body.business_hours,
        can_goto_customer_location: req.body.can_goto_customer_location,
        bio: req.body.bio
      });
      partner.save()
        .then(savedPartner => {
          authCtrl.register({
            email: savedPartner.email,
            password: req.body.password,
            user_id: savedPartner.partner_id,
            _id: savedPartner._id
          }, roles.partner)
          .then(result => res.status(200).json({
            status: "success",
            result: result
          }))
          .catch(e => res.status(500).json({
            status:"error",
            message:"Error adding partner"
        }));
        })
        .catch(e => res.status(500).json({
          status:"error",
          message:"Error adding partner"
      }));
    })
}
const get = (req, res, next) => {
  const { limit = 50, skip = 0 } = req.query;
  Partner.list({ limit, skip })
    .then(partners => res.status(200).json({
      status: "success",
      result: partners
    }))
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error getting partners"
  }));
}
/**
 * update partner
 * @property {Object} req.body - Updated properties
 * @returns {Service}
 */
const update = (req, res, next) => {
  let partner = req.partner;
  let updateLoc = false;
  if(req.body.lat && req.body.lon) {
    partner.loc = {
      type: 'Point',
      coordinates: [req.body.lon, req.body.lat]
    }
    updateLoc = true;
  }
  partner = _.extend(partner, req.body);
  partner.save()
    .then(result => {
      if(updateLoc) {
        ServiceItem.updateLocationOfServiceItem(result._id, partner.loc)
        .then(updatedLoc => {
          console.log(updatedLoc)
          return res.status(200).json({
            status: "success",
            result: result
          })
        })
      } else {
        return res.status(200).json({
          status: "success",
          result: result
        })
      }
    })
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error updating partner"
  }));
}

/**
 * update partner using token
 * @property {Object} req.body - Updated properties
 * @returns {Service}
 */
const updatePartner = (req, res, next) => {
  Partner.get(req.authUser['custom:_id'])
    .then((partner) => {
      let updateLoc = false;
      if(req.body.lat && req.body.lon) {
        partner.loc = {
          type: 'Point',
          coordinates: [req.body.lon, req.body.lat]
        }
        updateLoc = true;
      }
      partner = _.extend(partner, req.body);
      partner.save()
        .then(result => {
          if(updateLoc) {
            ServiceItem.updateLocationOfServiceItem(result._id, partner.loc)
            .then(updatedLoc => {
              console.log(updatedLoc)
              return res.status(200).json({
                status: "success",
                result: result
              })
            })
          } else {
            return res.status(200).json({
              status: "success",
              result: result
            })
          }  
        })
        .catch(e => res.status(500).json({
          status:"error",
          message:"Error updating partner"
      }));
    })
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error updating partner"
  }));
}
/**
 * Get partner
 * @returns {Partner}
 */
const getPartner = (req, res) => {
  return res.status(200).json({
    status: "success",
    result: req.partner
  });
}
/**
 * Load partner and append to req.
 */
const load = (req, res, next, partnerId) => {
    Partner.get(partnerId)
      .then((partner) => {
        req.partner = partner; // eslint-disable-line no-param-reassign
        return next();
      })
      .catch(e => res.status(500).json({
        status:"error",
        message:"Error loading partner"
    }));
  }

const profile = (req, res, next) => {
    Partner.getById(req.authUser['custom:_id'])
    .then(partner => res.status(200).json({
      status: "success",
      result: partner
    }))
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error loading profile"
  }));
  }

const reviews = (req, res, next) => {
    Partner.getReviews(req.authUser['custom:_id'])
    .then(partner => res.status(200).json({
      status: "success",
      result: partner
    }))
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error loading profile"
  }));
  }

const getServices = (req, res, next) => {
  Partner.getAssociatedServices(req.authUser['custom:_id'])
      .then(services => {
        return res.status(200).json({
          status: "success",
          result: services.accociated_services
        })
      })
      .catch(e => res.status(500).json({
        status:"error",
        message:"Error getting services"
    }));
  }

const getServiceItems = (req, res, next) => {
    ServiceItem.getPartnerServiceItemsByServiceId(req.authUser['custom:_id'], req.query.service)
        .then(services => res.status(200).json({
          status: "success",
          result: services
        }))
        .catch(e => res.status(500).json({
          status:"error",
          message:"Error getting services"
      }));
    }

const uploadPhotos = (req, res, next) => {
    multipleUpload(req, res, function(err) {
      if (err) {
        return res.status(422).send({
          status:"error",
          message:'Image Upload Error'
        });
      }
      const photos = req.files.map(f => f.location);
      Partner.updatePhoto(req.authUser['custom:_id'], photos)
        .then(updatedPartner => {
          res.status(200).json({
            status: "success",
            result: {images: updatedPartner}
          })
        })
        .catch(e => res.status(500).json({
          status:"error",
          message:"Error uploading photo"
      }));
    });
  }

  const updateProfilePhoto = (req, res, next) => {
    singleUpload(req, res, function(err) {
      if (err) {
        return res.status(422).send({
          status:"error",
          message:'Image Upload Error'
        });
      }
  
      Partner.updateProfilePhoto(req.authUser['custom:_id'], req.file.location)
        .then(updatedPartner => {
          res.json({
            status: "success",
            result: {profile_photo: updatedPartner.profile_photo}
          })
        })
        .catch(e => res.status(500).json({
          status:"error",
          message:"Error updating photo"
      }));
    });
  }

  const orders = (req, res, next) => {
    Partner.getPartnerOrders(req.authUser['custom:_id'])
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

  const getOrdersForPartnerToQuote = (req, res, next) => {
    const { limit = 50, skip = 0 } = req.query;
    Order.getOrdersForPartnerToQuote(skip, limit, req.authUser['custom:_id'])
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

  const getOngoingOrders = (req, res, next) => {
    const { limit = 50, skip = 0 } = req.query;
    Order.getOngoingOrders(skip, limit, req.authUser['custom:_id'])
      .then(orders => {
        const filteredOrder = orders.filter(item => {
          if(item.quotes.find(q => q.quote_partner == req.authUser['custom:_id'])) {
            return true;
          }
          return false;
        })
        return res.status(200).json({
          status: "success",
          result: filteredOrder
        });
      })
      .catch(e => res.status(500).json({
        status:"error",
        message:"Error getting orders"
    }));
  }

  const associateServices = (req, res, next) => {
    Partner.associateServices(req.authUser['custom:_id'], req.body.services)
      .then(partner => {
        return res.status(200).json({
          status: "success",
          result: 'Services accociated successfully.'
        });
      })
      .catch(e => res.status(500).json({
        status:"error",
        message:"Error getting orders"
    }));
  }

export default {add, get, load, getPartner, update, profile, getServices, uploadPhotos, orders, reviews, updatePartner, getOrdersForPartnerToQuote, updateProfilePhoto, getServiceItems, getOngoingOrders, associateServices}