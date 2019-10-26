import _ from 'underscore';
import mongoose from 'mongoose';
import Order from '../models/order.model';
import Quote from '../models/quote.model';
import Partner from '../models/partner.model';
import Notification from '../models/notification.model';
import { notification_types } from '../helpers/constants';

const add = (req, res, next) => {
  if(req.order.status == 4 && req.order.quotes.length > 0) {
    return res.status(200).json({
      status: "success",
      result: "Pending quote limit exceeds"
    })
  } else if(req.order.quotes.length >= 5) {
    Order.lockOrderForQuote(req.order._id)
      .then(result => {
        return res.status(200).json({
          status: "success",
          result: "Pending quote limit exceeds"
        })
      })
  } else if(req.order.status == 4 && req.order.quotes.length == 0) {
    Order.unlockOrderForQuote(req.order._id)
      .then(result => {
        const quote = new Quote({
          order_id: req.order._id,
          quote_partner: mongoose.Types.ObjectId(req.authUser['custom:_id']),
          quote_explanation: req.body.quote_explanation,
          service_address: req.body.service_address,
          service_location: {
            type: 'Point',
            coordinates: [req.body.lon, req.body.lat]
          },
          price: req.body.price,
        });
        quote.save()
          .then(savedQuote => {
            console.log(req.authUser['custom:_id']);
            Order.addToQuoteList(req.order._id, savedQuote._id, req.authUser['custom:_id'])
              .then(savedOrder => {
                Partner.addToQuoteList(req.authUser['custom:_id'], savedQuote._id)
                  .then(savedPartner => {
                    const notification = new Notification({
                      user_email: req.order.customer.email,
                      notification_title: 'New Quote',
                      notification_body: `You have a new quote from ${savedPartner.first_name} for ${req.order.service.name}`,
                      notification_data: {
                        notification_type: notification_types.quote_received,
                        payload: savedQuote._id
                      }
                    })
                    notification.save()
                    return res.status(200).json({
                      status: "success",
                      result: savedQuote
                    })
                  })
              })
          })
          .catch(e => res.status(500).json({
            status:"error",
            message:"Error adding quote"
        }));
      })
  } else {
    const quote = new Quote({
      order_id: req.order._id,
      quote_partner: mongoose.Types.ObjectId(req.authUser['custom:_id']),
      quote_explanation: req.body.quote_explanation,
      service_address: req.body.service_address,
      service_location: {
        type: 'Point',
        coordinates: [req.body.lon, req.body.lat]
      },
      price: req.body.price,
    });
    quote.save()
      .then(savedQuote => {
        Order.addToQuoteList(req.order._id, savedQuote._id, req.authUser['custom:_id'])
          .then(savedOrder => {
            Partner.addToQuoteList(req.authUser['custom:_id'], savedQuote._id)
              .then(savedPartner => {
                const notification = new Notification({
                  user_email: req.order.customer.email,
                  notification_title: 'New Quote',
                  notification_body: `You have a new quote from ${savedPartner.first_name} for ${req.order.service.name}`,
                  notification_data: {
                    notification_type: notification_types.quote_received,
                    payload: savedQuote._id
                  }
                })
                notification.save()
                return res.status(200).json({
                  status: "success",
                  result: savedQuote
                })
              })
          })
      })
      .catch(e => res.status(500).json({
        status:"error",
        message:"Error adding quote"
    }));
  }
}

/**
 * update quote
 * @property {Object} req.body - Updated properties
 * @returns {Order}
 */
const update = (req, res, next) => {
    let quote = req.quote;
    quote = _.extend(quote, req.body);
    quote.save()
      .then(savedQuote => res.status(200).json({
        status: "success",
        result: savedQuote
      }))
      .catch(e => res.status(500).json({
        status:"error",
        message:"Error updating quote"
    }));
  }

/**
 * Get quote
 * @returns {Quote}
 */
const getQuote = (req, res) => {
  return res.status(200).json({
    status: "success",
    result: req.quote
  });
}

/**
 * Get quote
 * @returns {Quote}
 */
const acceptQuote = (req, res, next) => {
  Quote.acceptQuote(req.quote._id)
    .then(updatedQuote => {
      Order.updateAppointedPartner(updatedQuote.order_id, updatedQuote.quote_partner, updatedQuote.price)
        .then(order => {
          Partner.addOrder(updatedQuote.quote_partner, updatedQuote.order_id)
            .then(partner => {
              Order.getOrderFull(updatedQuote.order_id)
                .then(orderFull => {
                  const notification = new Notification({
                    user_email: partner.email,
                    notification_title: 'Quote accepted',
                    notification_body: `Congrats! Your quote for ${order.service.name} has been accepted by ${orderFull.customer.first_name} ${orderFull.customer.last_name}`,
                    notification_data: {
                      notification_type: notification_types.quote_accepted,
                      payload: updatedQuote.order_id
                    }
                  })
                  notification.save();
                  return res.status(200).json({
                    status: "success",
                    result: updatedQuote
                  });
                })
            })
        })
        .catch(e => res.status(500).json({
          status:"error",
          message:"Error accepting quote"
      }));
    })
    .catch(e => next(e));
}

const rejectQuote = (req, res) => {
  Quote.rejectQuote(req.quote._id)
    .then(updatedQuote => {
      Order.addToRejectedPartnerList(req.quote.order_id, req.quote.quote_partner, req.quote._id)
        .then(rej => {
          return res.status(200).json({
            status: "success",
            result: updatedQuote
          });
        })
    })
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error rejecting quote"
  }));
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
      .catch(e => next(e));
  }
/**
 * Load quote and append to req.
 */
const loadQuote = (req, res, next, quoteId) => {
    Quote.get(quoteId)
      .then((quote) => {
        req.quote = quote; // eslint-disable-line no-param-reassign
        return next();
      })
      .catch(e => res.status(500).json({
        status:"error",
        message:"Error loading quote"
    }));
  }


export default {add, loadOrder, loadQuote, update, getQuote, acceptQuote, rejectQuote}