import _ from 'lodash';
import Joi from 'joi';
import Util from 'util';
import Boom from 'boom';
import Constants from '../commons/constants';
import Shopify from '../commons/shopify';

const inspect = Util.inspect;

const options = {
  auth: Constants.AUTH.ALL,
  description: 'Get Collection By Id',
  tags: ['api'],
  validate: {
    params: {
      id: Joi.number().integer().positive()
        .description('Collection Id')
        .required()
    }
  },
  plugins: {
    'hapi-swagger': {
      responses: _.omit(Constants.API_STATUS_CODES, [201])
    }
  },
  handler: async(request, reply) => {
    try {
      let collection;
      try {
        collection = await Shopify.smartCollection.get(request.params.id);
      } catch (err) {
        // NO-OP
      }

      if (!collection) {
        collection = await Shopify.customCollection.get(request.params.id);
      }
      return reply(collection);
    } catch (err) {
      request.log(['error', __filename], `handler failed: ${inspect(err)}`);
      return reply(Boom.notFound('Collection Not Found'));
    }
  }
};

// eslint-disable-next-line no-unused-vars
const handler = (server) => {
  const details = {
    method: ['GET'],
    path: '/api/collections/{id}',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
