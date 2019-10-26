import Promise from 'bluebird';
import mongoose from 'mongoose';
/**
 * Notification Schema
 */
const NotificationSchema = new mongoose.Schema({
  user_email: {
    type: String,
    required: true,
  },  
  notification_title: {
    type: String,
    required: true,
  },
  notification_body: {
    type: String,
    required: true,
  },
  notification_data: {
    notification_type: String,
    payload: String
  },
  status: {
    type: Number,
    required: true,
    default: 1
  },
});

/**
 * Statics
 */
NotificationSchema.statics = {
   /**
     * List notifications
     * @returns {Promise<Service[]>}
     */
    list() {
      return this.find({status: 1})
        .exec();
    },
    updateNotificationStatus(ids) {
      return this.where({notification_id: { $in: ids}})
        .setOptions({ multi: true })
        .update({ $set: { status: 2 }})
        .exec()
    }
}
/**
 * @typedef Notification
 */
export default mongoose.model('Notification', NotificationSchema);