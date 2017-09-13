import _ from 'lodash';
import Joi from 'joi';
import Util from 'util';
import Boom from 'boom';
import Constants from '../commons/constants';
import Mailer from '../commons/mailer';
import ContactUsModel from '../models/contact_us';

const inspect = Util.inspect;

const options = {
  auth: Constants.AUTH.ALL,
  description: 'Create Contact-Us Details',
  tags: ['api'],
  validate: {
    payload: {
      from: Joi.string().trim().lowercase().email({
        minDomainAtoms: 2
      }).required(), // eslint-disable-line newline-per-chained-call
      name: Joi.string().trim()
        .description('Sender Name')
        .required(),
      subject: Joi.string().trim()
        .description('Subject').required(),
      issue: Joi.string().trim()
        .description('Issue Description')
        .required(),
      message: Joi.string().trim()
        .description('Message').required()
    }
  },
  plugins: {
    'hapi-swagger': {
      responses: _.omit(Constants.API_STATUS_CODES, [201])
    }
  },
  handler: async(request, reply) => {
    try {
      const opts = _.cloneDeep(request.payload);
      await ContactUsModel.createOrUpdate(opts);

      await Mailer.dispatchMail('contact-us', request.payload.from, process.env.CONTACT_US_EMAIL, opts);
      return reply({
        message: 'Message sent successfully'
      });
    } catch (err) {
      request.log(['error', __filename], `handler failed: ${inspect(err)}`);
      return reply(Boom.wrap(err, 417));
    }
  }
};

// eslint-disable-next-line no-unused-vars
const handler = (server) => {
  const details = {
    method: ['POST'],
    path: '/api/contact-us',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
