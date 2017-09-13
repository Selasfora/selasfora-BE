import _ from 'lodash';
import Joi from 'joi';
import Util from 'util';
import Boom from 'boom';
import Constants from '../commons/constants';
import Shopify from '../commons/shopify';

const inspect = Util.inspect;

const options = {
  auth: Constants.AUTH.ALL,
  description: 'Get all blogs',
  tags: ['api'],
  validate: {
    query: {
      since_id: Joi.number().integer().positive()
        .description('Restrict results to after the specified ID')
        .optional(),
      handle: Joi.string().trim()
        .description('Filter by blog handle')
        .optional(),
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
      const blogs = await Shopify.blog.list(request.query);
      return reply(blogs);
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
    path: '/api/blogs',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
