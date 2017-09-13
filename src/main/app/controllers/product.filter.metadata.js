import _ from 'lodash';
import Util from 'util';
import Boom from 'boom';
import Constants from '../commons/constants';
import ColorFilterModel from '../models/color.filter';
import MaterialFilterModel from '../models/material.filter';
import MoodFilterModel from '../models/mood.filter';
import PriceFilterModel from '../models/price.filter';
import SortByFilterModel from '../models/sortby.filter';

const inspect = Util.inspect;

const options = {
  auth: Constants.AUTH.ALL,
  description: 'Get Product Filters',
  tags: ['api'],
  plugins: {
    'hapi-swagger': {
      responses: _.omit(Constants.API_STATUS_CODES, [201])
    }
  },
  handler: async(request, reply) => {
    try {
      const filters = {
        color: await ColorFilterModel.findAll([]),
        material: await MaterialFilterModel.findAll([]),
        mood: await MoodFilterModel.findAll([]),
        price: await PriceFilterModel.findAll([]),
        sort_by: await SortByFilterModel.findAll([])
      };

      return reply(filters);
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
    path: '/api/products/filters',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
