import apn from 'apn';

const options = {
    token: {
      key: 'src/services/AuthKey_FYJRK4QLU8.p8',
      keyId: "FYJRK4QLU8",
      teamId: "63632B255F"
    },
    production: false
  };
   
  const apnProvider = new apn.Provider(options);

export const sendIos = (device, notification) => {
    const note = new apn.Notification();
 
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.sound = "ping.aiff";
    note.alert = notification.title;
    note.payload = { 'message': notification.notification_body, 'data': notification.notification_data };

    return new Promise((resolve, reject) => {
      apnProvider.send(note, device).then( (result) => {
        resolve(result);
      });  
    })

}