import _ from 'lodash';
import Joi from 'joi';
import Util from 'util';
import Boom from 'boom';
import Constants from '../commons/constants';
import Shopify from '../commons/shopify';

const inspect = Util.inspect;

const options = {
  auth: Constants.AUTH.ALL,
  description: 'Get Shop Details',
  tags: ['api'],
  plugins: {
    'hapi-swagger': {
      responses: _.omit(Constants.API_STATUS_CODES, [201])
    }
  },
  handler: async (request, reply) => {
    try {
      const shopDetails = await Shopify.shop.get();
      return reply(shopDetails);
    } catch (err) {
      request.log(['error', __filename], `handler failed: ${inspect(err)}`);
      return reply(Boom.notFound('Shop Not Found'));
    }
  }
};

// eslint-disable-next-line no-unused-vars
const handler = (server) => {
  const details = {
    method: ['GET'],
    path: '/api/shop/details',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
