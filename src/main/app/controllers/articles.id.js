import _ from 'lodash';
import Joi from 'joi';
import Util from 'util';
import Boom from 'boom';
import Constants from '../commons/constants';
import Shopify from '../commons/shopify';

const inspect = Util.inspect;

const options = {
  auth: Constants.AUTH.ALL,
  description: 'Get Article By Id',
  tags: ['api'],
  validate: {
    params: {
      id: Joi.number().integer().positive()
        .description('Article Id')
        .required()
    }
    // ,
    // query: {
    //   fields: Joi.string().trim()
    //     .description('comma-separated list of fields to include in the response')
    //     .optional()
    // }
  },
  plugins: {
    'hapi-swagger': {
      responses: _.omit(Constants.API_STATUS_CODES, [201])
    }
  },
  handler: async(request, reply) => {
    try {
      // const article = await Shopify.article.get('', request.params.id, request.query);
      const articles = await Shopify.article.list('all');
      const article = _.find(articles, ['id', request.params.id]);
      return reply(article);
    } catch (err) {
      request.log(['error', __filename], `handler failed: ${inspect(err)}`);
      return reply(Boom.notFound('Article Not Found'));
    }
  }
};

// eslint-disable-next-line no-unused-vars
const handler = (server) => {
  const details = {
    method: ['GET'],
    path: '/api/articles/{id}',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
