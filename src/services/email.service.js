import mailgun from 'mailgun-js';

const domainName = 'mg.scruits.com';
const key = 'de28479712932851752792d2c24a2bed-2416cf28-35568e5e';
const mailgunConfig = mailgun({ apiKey: key, domain: domainName });

const prepareEmailBody = () => {
  let template = `template`;
  return template; 
};

const sendNewEmail = (from, to, subject, body) => {
  const data = {
    from: from, //'Mailgun Sandbox <postmaster@sandbox0960f424b23b42d19e2ffe780108233e.mailgun.org>',
    to: to,
    subject: subject,
    text: body
  };
  mailgunConfig.messages().send(data, (error, body) => {
    console.log(error); //eslint-disable-line
    console.log(body); //eslint-disable-line
  });
};

export default sendNewEmail;