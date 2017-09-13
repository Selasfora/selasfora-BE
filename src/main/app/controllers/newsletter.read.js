import _ from 'lodash';
import Util from 'util';
import Boom from 'boom';
import Constants from '../commons/constants';
import NewsletterModel from '../models/newsletter';

const inspect = Util.inspect;

const options = {
  auth: Constants.AUTH.ALL,
  description: 'Get Newsletter subscribers',
  tags: ['api'],
  plugins: {
    'hapi-swagger': {
      responses: _.omit(Constants.API_STATUS_CODES, [201])
    }
  },
  handler: async(request, reply) => {
    try {
      const active = await NewsletterModel.findAll(NewsletterModel.buildCriteria('is_active', true));
      const passive = await NewsletterModel.findAll(NewsletterModel.buildCriteria('is_active', false));

      const emails = {
        active,
        passive
      };
      return reply(emails);
    } catch (err) {
      request.log(['error', __filename], `handler failed: ${inspect(err)}`);
      return reply(Boom.wrap(err, 417));
    }
  }
};

// eslint-disable-next-line no-unused-vars
const handler = (server) => {
  const details = {
    method: ['GET'],
    path: '/api/newsletters',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
