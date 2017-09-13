import _ from 'lodash';
import Joi from 'joi';
import Util from 'util';
import Boom from 'boom';
import Constants from '../commons/constants';
import NewsletterModel from '../models/newsletter';

const inspect = Util.inspect;

const options = {
  auth: Constants.AUTH.ALL,
  description: 'Get Newsletter subscribers',
  tags: ['api'],
  validate: {
    payload: {
      email: Joi.string().trim().lowercase().email({
        minDomainAtoms: 2
      })
    }
  },
  plugins: {
    'hapi-swagger': {
      responses: _.omit(Constants.API_STATUS_CODES, [200])
    }
  },
  handler: async(request, reply) => {
    try {
      const newsletter = await NewsletterModel.createOrUpdate(request.payload);
      return reply(newsletter).code(201);
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
    path: '/api/newsletters',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
