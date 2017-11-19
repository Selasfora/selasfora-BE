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
      limit: Joi.number().integer().positive().default(50)
        .max(250)
        .description('Amount of results')
        .optional(),
      page: Joi.number().integer().positive().default(1)
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
        .description('Sort By')
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
      const params = {
        published_status: 'published',
        limit: request.query.limit,
        page: request.query.page,
        product_type: request.query.product_type
      };

      const products = await Shopify.product.list(params);
      let final_products = [];

      const filters = {
        color: _.compact(_.words(request.query.color, /[^, ]+/g)),
        material: _.compact(_.words(request.query.material, /[^, ]+/g)),
        mood: _.compact(_.words(request.query.mood, /[^, ]+/g)),
        max_price: request.query.max_price || -1,
        min_price: request.query.min_price || 100000000000000
      };

      const sort_by_parameter = request.query.sort_by ? request.query.sort_by : undefined;

      if (!_.isEmpty(filters.color) || !_.isEmpty(filters.material) || !_.isEmpty(filters.mood) ||
        filters.max_price || filters.min_price) {
        for (const product of products) {
          let average_price = 0;
          for (const variant of product.variants) {
            if (variant.price >= average_price) {
              average_price = variant.price;
            }

            product.average_price = average_price;

            if ((variant.price <= filters.max_price &&
                variant.price >= filters.min_price) ||
              _.includes(filters.material, variant.option3) ||
              _.includes(filters.mood, variant.option1) ||
              _.includes(filters.color, variant.option2)) {
              final_products.push(product);
              break;
            }
          }
        }
      } else {
        final_products = products;
      }

      if (sort_by_parameter) {
        if (sort_by_parameter === 'Newest') {
          final_products = _.reverse(_.sortBy(final_products, ['created_at']));
        } else if (sort_by_parameter === 'Highest Price') {
          final_products = _.reverse(_.sortBy(final_products, ['average_price']));
        } else if (sort_by_parameter === 'Lowest Price') {
          final_products = _.sortBy(final_products, ['average_price']);
        }
      }

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
