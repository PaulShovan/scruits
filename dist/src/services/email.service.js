"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mailgunJs = _interopRequireDefault(require("mailgun-js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var domainName = 'mg.scruits.com';
var key = 'de28479712932851752792d2c24a2bed-2416cf28-35568e5e';
var mailgunConfig = (0, _mailgunJs.default)({
  apiKey: key,
  domain: domainName
});

var prepareEmailBody = function prepareEmailBody() {
  var template = "template";
  return template;
};

var sendNewEmail = function sendNewEmail(from, to, subject, body) {
  var data = {
    from: from,
    //'Mailgun Sandbox <postmaster@sandbox0960f424b23b42d19e2ffe780108233e.mailgun.org>',
    to: to,
    subject: subject,
    text: body
  };
  mailgunConfig.messages().send(data, function (error, body) {
    console.log(error); //eslint-disable-line

    console.log(body); //eslint-disable-line
  });
};

var _default = sendNewEmail;
exports.default = _default;
//# sourceMappingURL=email.service.js.map
