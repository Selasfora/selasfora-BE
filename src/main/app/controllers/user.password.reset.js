import Util from 'util';
import Boom from 'boom';
import _ from 'lodash';
import JWT from 'jsonwebtoken';
import UserModel from '../models/user';
import Config from '../../config';
import Constants from '../commons/constants';

const inspect = Util.inspect;
const validator = UserModel.validatorRules();
const options = {
  auth: Constants.AUTH.ALL,
  description: 'Reset password  - Access - ALL',
  tags: ['api'],
  validate: {
    options: {
      allowUnknown: true,
      stripUnknown: true
    },
    payload: {
      // email: validator.email.required(),
      password: validator.password.required(),
      reset_password_token: validator.reset_password_token.required()
    }
  },
  plugins: {
    'hapi-swagger': {
      responses: _.omit(Constants.API_STATUS_CODES, [201])
    }
  },
  handler: async(request, reply) => {
    try {
      request.log(['info', __filename], `payload:: ${inspect(request.payload)}`);

      const tokenSecretkey = Config.get('passwordReset').get('tokenSecretkey');
      const decoded = JWT.decode(request.payload.reset_password_token, tokenSecretkey);

      if (!decoded.email) {
        return reply(Boom.notFound('User Not Found'));
      }

      // Fetch user with provided email
      const user = await UserModel.findOne(UserModel.buildCriteria('email', decoded.email));

      if (!user) {
        return reply(Boom.notFound('User Not Found'));
      }
      request.log(['info', __filename], `user found - ${inspect(user)}`);

      // Validate token
      if (decoded.tokenId !== user.reset_password_token) {
        return reply(Boom.badRequest('Invalid Token'));
      }

      // Reset token and create hash from password
      user.reset_password_sent_at = null;
      user.reset_password_token = null;
      user.encrypted_password = request.payload.password;
      const updatedUser = await UserModel.createOrUpdate(user);

      request.log(['info', __filename], `updated response - ${inspect(updatedUser)}`);
      return reply(updatedUser);
    } catch (err) {
      request.log(['error', __filename], `handler failed: ${inspect(err)}`);
      return reply(Boom.wrap(err, 417));
    }
  }
};

const handler = () => {
  const details = {
    method: ['POST'],
    path: '/api/users/reset_password',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
