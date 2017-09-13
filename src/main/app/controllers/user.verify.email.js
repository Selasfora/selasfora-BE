import Boom from 'boom';
import _ from 'lodash';
import UserModel from '../models/user';
import Constants from '../commons/constants';

const validator = UserModel.validatorRules();
const options = {
  auth: Constants.AUTH.ALL,
  description: 'Verify Email Token  - Access - ALL',
  tags: ['api'],
  validate: {
    query: {
      email: validator.email.required(),
      verification_code: validator.password.required()
    }
  },
  plugins: {
    'hapi-swagger': {
      responses: _.omit(Constants.API_STATUS_CODES, [200])
    }
  },
  handler: async(request, reply) => {
    // Fetch user with provided email
    const user = await UserModel.findOne(UserModel.buildCriteria('email', request.query.email));

    if (!user) {
      return reply(Boom.notFound('User Not Found'));
    }

    // Validate token
    if (request.query.verification_code !== user.confirmation_token) {
      return reply(Boom.badRequest('Invalid Token'));
    }

    // Reset token and create hash from password
    user.confirmed_at = new Date();
    const updatedUser = await UserModel.createOrUpdate(user);
    return reply(updatedUser);
  }
};

const handler = () => {
  const details = {
    method: ['GET'],
    path: '/api/users/verifyEmail',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
