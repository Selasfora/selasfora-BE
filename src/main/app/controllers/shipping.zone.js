import _ from 'lodash';
import Joi from 'joi';
import Util from 'util';
import Boom from 'boom';
import Constants from '../commons/constants';
import Shopify from '../commons/shopify';

const inspect = Util.inspect;

const options = {
  auth: Constants.AUTH.ALL,
  description: 'Get All Shipping Zones',
  tags: ['api'],
  validate: {
    query: {
      fields: Joi.string().trim()
        .description('comma-separated list of fields to include in the response')
        .optional()
    }
  },
  plugins: {
    'hapi-swagger': {
      responses: _.omit(Constants.API_STATUS_CODES, [201])
    }
  },
  handler: async(request, reply) => {
    try {
      const zones = await Shopify.shippingZone.list(request.query);
      return reply(zones);
    } catch (err) {
      request.log(['error', __filename], `handler failed: ${inspect(err)}`);
      return reply(Boom.notFound('Shipping Zones Not Found'));
    }
  }
};

// eslint-disable-next-line no-unused-vars
const handler = (server) => {
  const details = {
    method: ['GET'],
    path: '/api/shipping_zones',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
