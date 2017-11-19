import _ from 'lodash';
import Joi from 'joi';
import Util from 'util';
import Boom from 'boom';
import Constants from '../commons/constants';
import Shopify from '../commons/shopify';

const inspect = Util.inspect;

const options = {
  auth: Constants.AUTH.ALL,
  description: 'Get all Collections',
  tags: ['api'],
  validate: {
    query: {
      limit: Joi.number().integer().positive().default(50)
        .max(250)
        .description('Amount of results')
        .optional(),
      page: Joi.number().integer().positive().default(1)
        .description('Page to show')
        .optional(),
      ids: Joi.string().trim()
        .description('A comma-separated list of collection ids')
        .optional(),
      since_id: Joi.number().integer().positive()
        .description('Restrict results to after the specified ID')
        .optional(),
      title: Joi.string().trim()
        .description('Show custom collections with given title')
        .optional(),
      product_id: Joi.string().trim()
        .description('Show custom collections that includes given product')
        .optional(),
      handle: Joi.string().trim()
        .description('Filter by custom collection handle')
        .optional(),
      updated_at_min: Joi.string().trim()
        .description('Show custom collections last updated after date (format: 2014-04-25T16:15:47-04:00)')
        .optional(),
      updated_at_max: Joi.string().trim()
        .description('Show custom collections last updated before date (format: 2014-04-25T16:15:47-04:00)')
        .optional(),
      published_at_min: Joi.string().trim()
        .description('Show custom collections published after date (format: 2014-04-25T16:15:47-04:00)')
        .optional(),
      published_at_max: Joi.string().trim()
        .description('Show custom collections published before date (format: 2014-04-25T16:15:47-04:00)')
        .optional(),
      published_status: Joi.string().trim()
        .description('<p>published - Show only published custom collections </p><br>' +
          '<p>unpublished - Show only unpublished custom collections </p><br>' +
          '<p>any - Show all custom collections (default)</p>')
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
      const params = _.cloneDeep(request.query);
      // params.published_status = 'published';

      const customCollections = await Shopify.customCollection.list(params);
      const smartCollections = await Shopify.smartCollection.list(params);
      return reply(_.concat(customCollections, smartCollections));
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
    path: '/api/collections',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
