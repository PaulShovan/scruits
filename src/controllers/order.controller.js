import _ from 'underscore';
import mongoose from 'mongoose';
import Order from '../models/order.model';
import Customer from '../models/customer.model';
import ServiceItem from '../models/serviceItem.model';
import Partner from '../models/partner.model';
import Notification from '../models/notification.model';
import { notification_types } from '../helpers/constants'

const add = (req, res, next) => {
  const order = new Order({
    order_schedule_date: new Date(req.body.order_schedule_date),
    service: req.body.service,
    request_budget: req.body.request_budget,
    time_range: req.body.time_range,
    payment_details: req.body.payment_details,
    customer: mongoose.Types.ObjectId(req.authUser['custom:_id'])
  });
  order.save()
    .then(savedOrder => {
      Customer.addToOrderList(req.authUser['custom:_id'], savedOrder._id)
        .then(savedCustomer => {
          res.status(200).json({
            status: "success",
            result: savedOrder
          })
        })
        .catch(e => res.status(500).json({
          status:"error",
          message:"Error adding order"
      }));
    })
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error adding order"
  }));
}

const addReview = (req, res, next) => {
  const review = {
    reviewed_by: req.authUser['custom:_id'],
    order: req.order._id,
    star: parseFloat(req.body.star),
    description: req.body.description
  }
  Partner.addReview(req.order.appointed_partner, review)
    .then(response => {
      return res.status(200).json({
        status: "success",
        result: review
      })
    })
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error adding review"
  }));
}

const get = (req, res, next) => {
  const { limit = 50, skip = 0, status = 1 } = req.query;
  Order.list({ limit, skip, status })
    .then(orders => res.status(200).json({
      status: "success",
      result: orders
    }))
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error getting order"
  }));
}

/**
 * update order
 * @property {Object} req.body - Updated properties
 * @returns {Order}
 */
const update = (req, res, next) => {
    let order = req.order;
    order = _.extend(order, req.body);
    order.save()
      .then(savedOrder => res.status(200).json({
        status: "success",
        result: savedOrder
      }))
      .catch(e => res.status(500).json({
        status:"error",
        message:"Error updating order"
    }));
  }

const updatePayment = (req, res, next) => {
    let payment = req.order.payment_details || {};
    payment.transaction_id = req.body.transaction_id;
    payment.amount = req.body.amount;
    payment.currency = req.body.currency || "CAD";
    payment.payment_type = req.body.payment_type;
    payment.status = 2

    Order.updatePayment(req.order._id, payment)
      .then(savedOrder => {
        Partner.updateTotalEarned(req.order.appointed_partner, parseFloat(payment.amount))
          .then(partner => {
            Customer.updateNumOfOrders(req.order.customer._id)
              .then(customer => res.status(200).json({
                status: "success",
                result: savedOrder.payment_details
              }))
          })
          .catch(e => res.status(500).json({
            status:"error",
            message:"Error updating payment"
        }));
      })
      .catch(e => res.status(500).json({
        status:"error",
        message:"Error updating payment"
    }));
  }

/**
 * Get order
 * @returns {Order}
 */
const getOrder = (req, res) => {
  return res.status(200).json(req.order);
}
/**
 * Load order and append to req.
 */
const loadOrder = (req, res, next, order) => {
    Order.getOrderFull(order)
      .then((order) => {
        req.order = order; // eslint-disable-line no-param-reassign
        return next();
      })
      .catch(e => {
        console.log(e);
        return res.status(500).json({
          status:"error",
          message:"Error loading order"
        })
      });
  }

const getAvailablePartners = (req, res, next) => {
    ServiceItem.find({$and: [{
      loc: {
         $near: {
          $maxDistance: 1000 * req.order.customer.service_search_radius,
          $geometry: {
           type: "Point",
           coordinates: req.order.customer.loc.coordinates
          }
         }
        }
       }, 
       // { service: req.order.service.id }, { price: { $lte: req.order.request_budget.max} }]}, 'partner')
       { service: req.order.service.id }]}, 'partner')
       .populate({ path: 'partner', select: 'email'})
       .exec((error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).json({
            status:"error",
            message:"Error getting available partners"
        });
        }
        if(results.length > 0) {
          results = results.filter(re => {
            return !req.order.partners_quoted.map(q=>q.toString()).includes(re.partner._id.toString())
          })
          const partners = results.map(p => p.partner ? p.partner._id : 0)
          const notifications = results.map(r => {
            return {
              user_email: r.partner.email,
              notification_title: 'New lead',
              notification_body: `You have a new lead for ${req.order.service.name}`,
              notification_data: {
                notification_type: notification_types.new_lead,
                payload: req.order._id
              }
            }
          })
          Notification.insertMany(notifications)
          Order.addToPartnerToQuoteList(req.order._id, partners)
            .then(resp => {
              return res.status(200).json({
                status: "success",
                result: results
              });
            })
            .catch(e => res.status(500).json({
              status:"error",
              message: e
          }));
        } else {
          return res.status(200).json({
            status: "success",
            result: []
          });
        }
        // TODO Send notification to partners with order id for quotes
    })
}

const rejectOrderForPartner = (req, res) => {
  Order.removeFromPartnerToQuoteList(req.order._id, req.authUser['custom:_id'])
    .then((order) => {
      return res.status(200).json({
        status: "success",
        result: 'Order rejected successfully'
      });
    })
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error rejecting order"
  }));
}

const getQuotes = (req, res, next) => {
  Order.getQuotes(req.query.orderid)
    .then(quotes => {
      return res.status(200).json({
        status: "success",
        result: quotes
      });
    })
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error getting quotes"
  }));
}

export default {add, get, getOrder, update, getAvailablePartners, loadOrder, getQuotes, addReview, updatePayment, rejectOrderForPartner}
