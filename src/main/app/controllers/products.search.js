import _ from 'lodash';
import Joi from 'joi';
import Util from 'util';
import Boom from 'boom';
import requestPromise from 'request-promise';
import Constants from '../commons/constants';
import Shopify from '../commons/shopify';
import Config from '../../config';

const inspect = Util.inspect;
const shopifyConfig = Config.get('shopify').toJS();

const options = {
  auth: Constants.AUTH.ALL,
  description: 'Get all Products',
  tags: ['api'],
  validate: {
    query: {
      collection_handle: Joi.string().trim()
        .description('Collection Handle')
        .optional(),
      limit: Joi.number().integer().positive().default(50)
        .max(250)
        .description('Amount of results')
        .optional(),
      page: Joi.number().integer().min(1).default(1)
        .description('Page to show')
        .optional(),
      product_type: Joi.string().trim().default('charm').allow(['charm', 'bracelet'])
        .description('Product Type')
        .optional(),
      color: Joi.string().trim()
        .description('Product Color')
        .optional(),
      material: Joi.string().trim()
        .description('Product Material')
        .optional(),
      mood: Joi.string().trim()
        .description('Mood')
        .optional(),
      sort_by: Joi.string().trim()
        .description('Sort By; Allowed "Newest", "Highest Price" and "Lowest Price" ')
        .optional(),

      min_price: Joi.number().integer().positive()
        .description('Min Price')
        .optional(),
      max_price: Joi.number().integer().positive()
        .description('Max Price')
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
      const limit = request.query.limit || 50;
      const page = ((request.query.page || 1) - 1);

      let products;
      if (request.query.collection_handle) {
        // Basically we'll have to fetch the product listing via this API -
        // https://selafore-staging.myshopify.com/collections/{collection-handle}/products.json
        // example
        // https://selafore-staging.myshopify.com/collections/daily-life-collection/products.json

        const uri = `https://${shopifyConfig.shopName}.myshopify.com/collections/${request.query.collection_handle}/products.json`;

        const opts = {
          uri,
          headers: {
            'User-Agent': 'Request-Promise' // Required otherwise shopify throws 403 error
          },
          json: true // Automatically parses the JSON string in the response
        };

        const prdResponse = await requestPromise(opts);
        products = prdResponse.products;
      } else {
        const params = {
          product_type: request.query.product_type
        };

        products = await Shopify.product.list(params);
      }

      let final_products = [];

      const filters = {
        color: _.map(_.compact(_.words(request.query.color, /[^, ]+/g)), _.toLower),
        material: _.map(_.compact(_.words(request.query.material, /[^, ]+/g)), _.toLower),
        // mood: _.compact(_.words(request.query.mood, /[^, ]+/g)),
        max_price: request.query.max_price || 0,
        min_price: request.query.min_price || 0
      };

      if (!_.isEmpty(filters.color) || !_.isEmpty(filters.material) || !_.isEmpty(filters.mood) ||
        filters.max_price || filters.min_price) {
        for (const product of products) {
          product.average_price = _.max(_.map(product.variants, 'price'));
        }

        _.each(products, (product) => {
          for (const variant of product.variants) {
            const satified = (
              (filters.max_price === 0 || variant.price <= filters.max_price) &&
              (filters.min_price === 0 || variant.price >= filters.min_price) &&
              // eslint-disable-next-line max-len
              // (_.isEmpty(filters.mood) || (!_.isEmpty(filters.mood) && _.includes(filters.mood, variant.option1))) &&
              (_.isEmpty(filters.color) || (!_.isEmpty(filters.color) && _.includes(filters.color, _.toLower(variant.option2)))) && // eslint-disable-line max-len
              (_.isEmpty(filters.material) || (!_.isEmpty(filters.material) && _.includes(filters.material, _.toLower(variant.option3)))) // eslint-disable-line max-len
            );

            if (satified) {
              final_products.push(product);
              break;
            }
          }
        });
      } else {
        final_products = products;
      }

      const sort_by_parameter = request.query.sort_by ? request.query.sort_by : undefined;
      if (sort_by_parameter) {
        if (sort_by_parameter === 'Newest') {
          final_products = _.reverse(_.sortBy(final_products, ['created_at']));
        } else if (sort_by_parameter === 'Highest Price') {
          final_products = _.reverse(_.sortBy(final_products, ['average_price']));
        } else if (sort_by_parameter === 'Lowest Price') {
          final_products = _.sortBy(final_products, ['average_price']);
        }
      }

      final_products = _.nth(_.chunk(final_products, limit), page) || [];
      return reply(final_products);
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
    path: '/api/products/search',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
