import _ from 'lodash';
import Joi from 'joi';
import Util from 'util';
import Boom from 'boom';
import Constants from '../commons/constants';
import Shopify from '../commons/shopify';

const inspect = Util.inspect;

const options = {
  auth: Constants.AUTH.ALL,
  description: 'Get all Articles',
  tags: ['api'],
  validate: {
    query: {
      blog_id: Joi.number().integer().positive()
        .description('Restrict results to after the specified ID')
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

      handle: Joi.string().trim()
        .description('Filter by article handle')
        .optional(),
      tag: Joi.string().trim()
        .description('Filter by article tag')
        .optional(),
      author: Joi.string().trim()
        .description('Filter by article author')
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
      params.published_status = 'published';
      delete params.blog_id;

      const blog_id = (request.query.blog_id === 0) ? 'all' : request.query.blog_id;

      const articles = await Shopify.article.list(blog_id, params);
      return reply(articles);
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
    path: '/api/articles',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
