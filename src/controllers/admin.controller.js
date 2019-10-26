import Customer from '../models/customer.model';
import Order from '../models/order.model';
import Partner from '../models/partner.model';
import Admin from '../models/admin.model';
import roles from '../helpers/constants';
import authCtrl from '../controllers/auth.controller';

const totalOrderPartnerCustomer = (req, res, next) => {
  Customer.count({})
    .then((customerCount) => {
      Order.count({})
        .then((orderCount) => {
          Partner.count({})
            .then((partnerCount) => {
                res.status(200).json({
                  status: "success",
                  result: {
                    customerCount,
                    orderCount,
                    partnerCount
                  }
                })
            })
            .catch(e => res.status(500).json({
              status:"error",
              message:"Error getting counts"
          })); 
        })
        .catch(e => res.status(500).json({
          status:"error",
          message:"Error getting counts"
      })); 
    })
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error getting counts"
  }));  
}

const addAdmin = (req, res, next) => {
  const admin = new Admin({
    name: req.body.name,
    email: req.body.email,
    address: req.body.address,
    phone: req.body.phone,
    role: roles.admin
  });
  admin.save()
    .then(savedCustomer => {
      authCtrl.register({
        email: savedCustomer.email,
        password: req.body.password,
        user_id: savedCustomer.admin_id,
        _id: savedCustomer._id
      }, roles.admin)
      .then(result => res.status(200).json({
        status: "success",
        result: result
      }))
      .catch(e => res.status(500).json({
        status:"error",
        message:"Error adding new admin"
      }));
    })
    .catch(e => res.status(500).json({
      status:"error",
      message:"Error adding new admin"
  }));
}

export default { totalOrderPartnerCustomer, addAdmin }