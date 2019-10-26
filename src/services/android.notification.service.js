import gcm from 'node-gcm';
const sender = new gcm.Sender('AAAA56Xu50s:APA91bE3vZc-VYZMveLr_KxUbGTCiuAAAhYI8JVbbZUUt-UHHLpyfaQsi6J4Z_DjMfrgNboeUVZTmDYfPiaR2o4b8I35uKHuAX1vd36miFWwurB8UUFonjed6tY3WhcYSDdYWOc-PD1O');

export const sendAndroid = (devices, notification) => {
    const message = new gcm.Message({
        collapseKey: 'demo',
        priority: 'high',
        contentAvailable: true,
        delayWhileIdle: true,
        timeToLive: 3,
        data: notification.notification_data,
        notification : {
            title : notification.notification_title,
            body: notification.notification_body
        }
    });
    return new Promise((resolve, reject) => {
        sender.send(message, {
            registrationTokens : devices // ['fa2JAfLHaYc:APA91bHF9MkMLpODx1tMwFLJEafTUxE5rWBMi1W8PUsL54QnjgzXb2uwP4lEzzYwlof0MZg6epIjK_TeKpyA3BRnZQ60IZmPbayNqCq1OtLm18sVRIqM0R6Gy5zXLCOY5eqvtkXVTZ87']
        }, (err, res) => {
            if(err){
                console.log(err);
                reject(err)
            }
            console.log(res);
            resolve(res);
        })
    })
}