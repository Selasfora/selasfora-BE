import _ from 'lodash';
import Joi from 'joi';
import Util from 'util';
import Boom from 'boom';
import requestPromise from 'request-promise';
import Constants from '../commons/constants';
import Shopify from '../commons/shopify';

const inspect = Util.inspect;

const options = {
  auth: Constants.AUTH.ALL,
  description: 'Get Supported Currencies',
  tags: ['api'],
  validate: {
    query: {
      baseCurrency: Joi.string().trim().default('USD')
        .description('Base Currency')
        .optional(),
      toCurrencies: Joi.string().trim().default('AUD,CHF,EUR,GBP,PLN')
        .description('To Currencies')
        .optional()
    }
  },
  plugins: {
    'hapi-swagger': {
      responses: _.omit(Constants.API_STATUS_CODES, [201])
    }
  },
  handler: async (request, reply) => {
    try {
      // TODO: pick from redis...if not available invoke...
      const base = request.query.baseCurrency || 'USD';
      const toCurrencies = request.query.toCurrencies || 'AUD,CHF,EUR,GBP,PLN';
      const uri = `https://api.fixer.io/latest?base=${base}&symbols=${toCurrencies}`;

      const opts = {
        uri,
        headers: {
          'User-Agent': 'Request-Promise' // Required otherwise shopify throws 403 error
        },
        json: true // Automatically parses the JSON string in the response
      };

      const response = await requestPromise(opts);
      return reply(response);
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
    path: '/api/currencies',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
