import Chatkit from '@pusher/chatkit-server';
import Customer from '../models/customer.model';
import Partner from '../models/partner.model';
import Admin from '../models/admin.model';
import { roles } from '../helpers/constants';

const chatkit = new Chatkit({
  instanceLocator: 'v1:us1:5fe5f4a3-222b-4b33-bf42-fa5174a7da74',
  key: '64740d6c-d5bb-4219-92be-fe639e181b54:Mu5AIwD0rFQXR9xbDLyQvUSABHAbLFnNxjWwx7N6Oko=',
});

const getName = (id, role) => {
  return new Promise((resolve, reject) => {
    if(role === roles.customer) {
      Customer.get(id)
        .then(customer => {
          resolve(`${customer.first_name} ${customer.last_name}`)
        })
    } else if(role === roles.partner) {
      Partner.get(id)
        .then(partner => {
          resolve(`${partner.first_name} ${partner.last_name}`)
        })
    } else {
      Admin.get(id)
        .then(admin => {
          resolve(admin.name)
        })
    }
  })
}

const addChatUser = (req, res) => {
    const { userId } = req.body;
    getName(req.authUser['custom:_id'], req.authUser['custom:role'])
      .then(name => {
        console.log(name);
        chatkit
          .createUser({
            id: userId,
            name: name,
          })
          .then(() => {
            return res.status(201).json({
                status: "success",
                message: 'user created for chat'
              });
          })
          .catch(err => {
            if (err.error === 'services/chatkit/user_already_exists') {
              console.log(`User already exists: ${userId}`);
              return res.status(200).json({
                status: "success",
                message: 'user already exists'
              });
            } else {
                return res.status(500).json({
                    status: "error",
                    message: err
                  });
            }
          });
      })
}

const authenticateUser = (req, res) => {
  const authData = chatkit.authenticate({
    userId: req.query.user_id,
  });
  return res.status(200).json( {
    "access_token": authData.body.access_token,
    "user_id": req.authUser['custom:_id'],
    "token_type":"access_token",
    "expires_in": authData.body.expires_in
  });
}

export default {addChatUser, authenticateUser}