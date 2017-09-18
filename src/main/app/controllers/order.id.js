import _ from 'lodash';
import Joi from 'joi';
import Util from 'util';
import Boom from 'boom';
import Constants from '../commons/constants';
import Shopify from '../commons/shopify';

const inspect = Util.inspect;

const options = {
  auth: Constants.AUTH.ALL,
  description: 'Get Order By Id',
  tags: ['api'],
  validate: {
    params: {
      id: Joi.number().integer().positive()
        .description('Order Id')
        .required()
    },
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
      const blogs = await Shopify.order.get(request.params.id, request.query);
      return reply(blogs);
    } catch (err) {
      request.log(['error', __filename], `handler failed: ${inspect(err)}`);
      return reply(Boom.notFound('Order Not Found'));
    }
  }
};

// eslint-disable-next-line no-unused-vars
const handler = (server) => {
  const details = {
    method: ['GET'],
    path: '/api/orders/{id}',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
