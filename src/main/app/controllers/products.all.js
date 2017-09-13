import _ from 'lodash';
import Joi from 'joi';
import Util from 'util';
import Boom from 'boom';
import Constants from '../commons/constants';
import Shopify from '../commons/shopify';

const inspect = Util.inspect;

const options = {
  auth: Constants.AUTH.ALL,
  description: 'Get all Products',
  tags: ['api'],
  validate: {
    query: {
      ids: Joi.string().trim()
        .description('A comma-separated list of product ids')
        .optional(),
      limit: Joi.number().integer().positive().default(50)
        .max(250)
        .description('Amount of results')
        .optional(),
      page: Joi.number().integer().positive().default(1)
        .description('Page to show')
        .optional(),
      since_id: Joi.number().integer().positive()
        .description('Restrict results to after the specified ID')
        .optional(),

      title: Joi.string().trim()
        .description('Filter by product title')
        .optional(),
      vendor: Joi.string().trim()
        .description('Filter by product vendor')
        .optional(),
      handle: Joi.string().trim()
        .description('Filter by product handle')
        .optional(),
      product_type: Joi.string().trim()
        .description('Filter by product type')
        .optional(),
      collection_id: Joi.string().trim()
        .description('Filter by collection id')
        .optional(),

      created_at_min: Joi.string().trim()
        .description('Show products created after date (format: 2014-04-25T16:15:47-04:00)')
        .optional(),
      created_at_max: Joi.string().trim()
        .description('Show products created before date (format: 2014-04-25T16:15:47-04:00)')
        .optional(),
      updated_at_min: Joi.string().trim()
        .description('Show products last updated after date (format: 2014-04-25T16:15:47-04:00)')
        .optional(),
      updated_at_max: Joi.string().trim()
        .description('Show products last updated before date (format: 2014-04-25T16:15:47-04:00)')
        .optional(),
      published_at_min: Joi.string().trim()
        .description('Show products published after date (format: 2014-04-25T16:15:47-04:00)')
        .optional(),
      published_at_max: Joi.string().trim()
        .description('Show products published before date (format: 2014-04-25T16:15:47-04:00)')
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
      const params = request.query;
      params.published_status = 'published';

      const products = await Shopify.product.list(params);
      return reply(products);
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
    path: '/api/products',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
