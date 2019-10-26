import Joi from 'joi'

export default {
    // POST /api/auth/register
    register: {
      body: {
        email: Joi.string().required(),
        password: Joi.string().required()
      }
    },
    // POST /api/auth/login
    login: {
      body: {
        email: Joi.string().required(),
        password: Joi.string().required()
      }
    },
    // POST /api/auth/verify
    verify: {
      body: {
        email: Joi.string().required(),
        code: Joi.string().required()
      }
    },
    // POST /api/auth/renew
    renew: {
      body: {
        email: Joi.string().required(),
        refreshToken: Joi.string().required()
      }
    },
    // POST /api/auth/updatepassword
    newpassword: {
      body: {
        email: Joi.string().required(),
        password: Joi.string().required(),
        newpassword: Joi.string().required()
      }
    },
    // POST /api/auth/forgotpassword
    forgotpassword: {
        body: {
            email: Joi.string().required()
        }
    },
    // POST /api/auth/confirmpassword
    confirmpassword: {
        body: {
            email: Joi.string().required(),
            code: Joi.string().required(),
            newpassword: Joi.string().required()
        }
    },
    // POST /api/auth/partner/register
    register_partner: {
      body: {
        email: Joi.string().required(),
        password: Joi.string().required(),
        phone: Joi.string().required(),
        address: Joi.object().required(),
        first_name: Joi.string().required(),
        last_name: Joi.string().required()
      }
    },
    // POST /api/auth/customer/register
    register_customer: {
      body: {
        email: Joi.string().required(),
        password: Joi.string().required(),
        phone: Joi.string().required(),
        address: Joi.object().required(),
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
      }
    },
    // POST /api/service/add
    add_service: {
      body: {
        service_details: Joi.string().required(),
        service_type: Joi.string().required(),
        service_title: Joi.string().required(),
        service_tags: Joi.array()
      }
    },
}
