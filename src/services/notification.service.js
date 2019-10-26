import Notification from '../models/notification.model';
import Device from '../models/device.model'
import { sendAndroid } from '../services/android.notification.service';
import { sendIos } from  '../services/ios.notification.service';
import sendNewEmail from '../services/email.service';

const interval = (func, wait, times) => {
  var interv = function(w, t){
    return function(){
      if(typeof t === "undefined" || t-- > 0){
        setTimeout(interv, w);
        try{
          func.call(null);
        }
        catch(e){
            t = 0;
            throw e.toString();
        }
      }
    };
  }(wait, times);
setTimeout(interv, wait);
};

export const saveNotificaton = (email, title, body) => {
  const notification = new Notification({
    user_email: email,
    notification_title: title,
    notification_body: body
  });
  notification.save()
    .then(res => {
      console.log('Notification saved');  
    })
};

const updateNotifications = (ids) => {
  Notification.updateNotificationStatus(ids)
    .then(res => {
      console.log('status updated');
    })
};

const sendNotifications = () => {
  Notification.list()
    .then(notifications => {
      if(!notifications || notifications.length <= 0) {
        return  
      }
      notifications.forEach(element => {
        Device.get(element.user_email)
          .then(res => {
            if(!res) {
              return  
            }
            if(res.platform === 'ios') {
              sendIos(res.device_id, element)
                .then(ack => {
                  updateNotifications([element.notification_id])
                }) 
            } else {
              sendAndroid([res.device_id], element)
                .then(ack => {
                  updateNotifications([element.notification_id])
                })
            }
              sendNewEmail('noreply@scruits.com', element.user_email, element.notification_title, element.notification_body);
              updateNotifications([element.notification_id]);
          });
      });
    });
};

export const runSendNotification = () => {
  interval(() => sendNotifications(), 5000)
};
