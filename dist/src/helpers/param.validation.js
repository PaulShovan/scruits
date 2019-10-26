"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _joi = _interopRequireDefault(require("joi"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  // POST /api/auth/register
  register: {
    body: {
      email: _joi.default.string().required(),
      password: _joi.default.string().required()
    }
  },
  // POST /api/auth/login
  login: {
    body: {
      email: _joi.default.string().required(),
      password: _joi.default.string().required()
    }
  },
  // POST /api/auth/verify
  verify: {
    body: {
      email: _joi.default.string().required(),
      code: _joi.default.string().required()
    }
  },
  // POST /api/auth/renew
  renew: {
    body: {
      email: _joi.default.string().required(),
      refreshToken: _joi.default.string().required()
    }
  },
  // POST /api/auth/updatepassword
  newpassword: {
    body: {
      email: _joi.default.string().required(),
      password: _joi.default.string().required(),
      newpassword: _joi.default.string().required()
    }
  },
  // POST /api/auth/forgotpassword
  forgotpassword: {
    body: {
      email: _joi.default.string().required()
    }
  },
  // POST /api/auth/confirmpassword
  confirmpassword: {
    body: {
      email: _joi.default.string().required(),
      code: _joi.default.string().required(),
      newpassword: _joi.default.string().required()
    }
  },
  // POST /api/auth/partner/register
  register_partner: {
    body: {
      email: _joi.default.string().required(),
      password: _joi.default.string().required(),
      phone: _joi.default.string().required(),
      address: _joi.default.object().required(),
      first_name: _joi.default.string().required(),
      last_name: _joi.default.string().required()
    }
  },
  // POST /api/auth/customer/register
  register_customer: {
    body: {
      email: _joi.default.string().required(),
      password: _joi.default.string().required(),
      phone: _joi.default.string().required(),
      address: _joi.default.object().required(),
      first_name: _joi.default.string().required(),
      last_name: _joi.default.string().required()
    }
  },
  // POST /api/service/add
  add_service: {
    body: {
      service_details: _joi.default.string().required(),
      service_type: _joi.default.string().required(),
      service_title: _joi.default.string().required(),
      service_tags: _joi.default.array()
    }
  }
};
exports.default = _default;
//# sourceMappingURL=param.validation.js.map
