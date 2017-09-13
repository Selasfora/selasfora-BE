import _ from 'lodash';
import Util from 'util';
import Boom from 'boom';
import Constants from '../commons/constants';
import ContactUsQueryModel from '../models/contactus.queryoptions';

const inspect = Util.inspect;

const options = {
  auth: Constants.AUTH.ALL,
  description: 'Get Contact-Us Query Options',
  tags: ['api'],
  plugins: {
    'hapi-swagger': {
      responses: _.omit(Constants.API_STATUS_CODES, [201])
    }
  },
  handler: async(request, reply) => {
    try {
      const queries = await ContactUsQueryModel.findAll([]);
      return reply(queries);
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
    path: '/api/contact-us/query-options',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
