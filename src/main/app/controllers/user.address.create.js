import Util from 'util';
import Joi from 'joi';
import Boom from 'boom';
import _ from 'lodash';
import Logger from 'winston';
import checkIfExists from '../policies/checkIfExists';
import isAuthorized from '../policies/isAuthorized';
import UserModel from '../models/user';
import Constants from '../commons/constants';
import Shopify from '../commons/shopify';

const inspect = Util.inspect;
const options = {
  auth: Constants.AUTH.ADMIN_OR_USER,
  description: 'Create User Address - Access - ALL',
  notes: 'NOTE: Some fields causes issues esp county, province and phone if proper data is not entered.',
  tags: ['api'],
  validate: {
    options: {
      allowUnknown: true,
      stripUnknown: true
    },
    params: {
      userId: Joi.number().integer().positive().description('User Id')
    },
    payload: {
      // name: Joi.string().trim().description('The customer\'s name').optional(),
      first_name: Joi.string().trim().description('The customer\'s first name').optional(),
      last_name: Joi.string().trim().description('The customer\'s last name').optional(),
      company: Joi.string().trim().description('The customer\'s company').optional(),
      address1: Joi.string().trim().description('The customer\'s mailing address').required(),
      address2: Joi.string().trim().description('An additional field for the customer\'s mailing address').optional(),
      city: Joi.string().trim().description('The customer\'s city').optional(),
      zip: Joi.string().trim().description('The customer\'s zip or postal code').optional(),
      country: Joi.string().trim().description('The customer\'s country').optional(),
      country_code: Joi.string().trim().max(2)
        .description('The two-letter country code corresponding to the customer\'s country')
        .optional(),
      country_name: Joi.string().trim().description('The customer\'s normalized country name').optional(),
      default: Joi.boolean().default(false)
        .description('Indicates whether this address is the default address for the customer. Valid values are true or false')
        .optional(),
      phone: Joi.string().trim().description('The customer\'s phone number for this mailing address').optional(),
      province: Joi.string().trim().description('The customer\'s province or state name').optional(),
      province_code: Joi.string().trim().max(2)
        .description('The two-letter pcode for the customer\'s province or state')
        .optional()
    }
  },
  plugins: {
    'hapi-swagger': {
      responses: _.omit(Constants.API_STATUS_CODES, [200])
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
        result = await Shopify.customerAddress.create(user.shopify_customer_id, request.payload);
      } catch (err) {
        Logger.error('failed to persist the customer address :: ', err);
        return reply(Boom.notFound('Failed to create address'));
      }

      return reply(result).code(201);
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
    path: '/api/users/{userId}/addresses',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
