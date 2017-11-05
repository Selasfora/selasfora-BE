import _ from 'lodash';
import Joi from 'joi';
import Util from 'util';
import Boom from 'boom';
import Logger from 'winston';
import requestPromise from 'request-promise';
import UserModel from '../models/user';
import checkIfExists from '../policies/checkIfExists';
import isAuthorized from '../policies/isAuthorized';
import Constants from '../commons/constants';
import Shopify from '../commons/shopify';
import Config from '../../config';

const shopifyConfig = Config.get('shopify').toJS();

const inspect = Util.inspect;

const options = {
  auth: Constants.AUTH.ADMIN_OR_USER,
  description: 'Get Orders For a customer',
  tags: ['api'],
  validate: {
    params: {
      userId: Joi.number().integer().positive().description('User Id'),
      orderId: Joi.number().integer().positive().description('Order Id')
    }
  },
  plugins: {
    'hapi-swagger': {
      responses: _.omit(Constants.API_STATUS_CODES, [201])
    },
    policies: [
      isAuthorized('params.userId'),
      checkIfExists(UserModel, 'User', ['id'], ['params.userId'])
    ]
  },
  handler: async(request, reply) => {
    try {
      const user = await UserModel.findOne(UserModel.buildCriteria('id', request.params.userId));

      try {
        const path = `https://${shopifyConfig.apiKey}:${shopifyConfig.password}@${shopifyConfig.shopName}.myshopify.com/admin/customers/${user.shopify_customer_id}/orders.json??fields=id`;
        const result = await requestPromise(path);

        const orderIds = _.map(result.orders, 'id');
        if (_.includes(orderIds, request.params.orderId)) {
          // const cancelPath = `https://${shopifyConfig.apiKey}:${shopifyConfig.password}@${shopifyConfig.shopName}.myshopify.com/admin/orders/${request.params.orderId}/cancel.json`;
          const cancelResult = await Shopify.orders.cancel(request.params.orderId);
          // const cancelResult = await requestPromise(cancelPath);
          return reply(cancelResult);
        }
        return reply(Boom.notFound('Order not found'));
      } catch (err) {
        Logger.error('failed to fetch the orders :: ', err);
        return reply(Boom.notFound('Failed to fetch the orders'));
      }
    } catch (err) {
      request.log(['error', __filename], `handler failed: ${inspect(err)}`);
      return reply(Boom.wrap(err, 417));
    }
  }
};

// eslint-disable-next-line no-unused-vars
const handler = (server) => {
  const details = {
    method: ['POST'],
    path: '/api/users/{userId}/orders/{orderId}/cancel',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
