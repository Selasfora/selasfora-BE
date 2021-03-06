import _ from 'lodash';
import Joi from 'joi';
import Util from 'util';
import Boom from 'boom';
import Logger from 'winston';
import UserModel from '../models/user';
import checkIfExists from '../policies/checkIfExists';
import isAuthorized from '../policies/isAuthorized';
import Constants from '../commons/constants';
import Shopify from '../commons/shopify';

const inspect = Util.inspect;

const options = {
  auth: Constants.AUTH.ADMIN_OR_USER,
  description: 'Set Default User Address by Id',
  tags: ['api'],
  validate: {
    params: {
      userId: Joi.number().integer().positive().description('User Id'),
      addressId: Joi.number().integer().positive().description('Address Id')
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

      let result;
      try {
        result = await Shopify.customerAddress.default(
          user.shopify_customer_id, request.params.addressId);
      } catch (err) {
        Logger.error('failed to update default user address :: ', err);
        return reply(Boom.notFound('Failed to update default address'));
      }

      return reply(result);
    } catch (err) {
      request.log(['error', __filename], `handler failed: ${inspect(err)}`);
      return reply(Boom.wrap(err, 417));
    }
  }
};

// eslint-disable-next-line no-unused-vars
const handler = (server) => {
  const details = {
    method: ['PUT'],
    path: '/api/users/{userId}/addresses/{addressId}/default',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
