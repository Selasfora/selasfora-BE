import Util from 'util';
import Boom from 'boom';
import _ from 'lodash';
import UserModel from '../models/user';
import checkIfExists from '../policies/checkIfExists';
import isAuthorized from '../policies/isAuthorized';
import Constants from '../commons/constants';

const inspect = Util.inspect;
const validator = UserModel.validatorRules();

const options = {
  auth: Constants.AUTH.ADMIN_OR_USER,
  description: 'Update User - Access - admin,user',
  tags: ['api'],
  validate: {
    options: {
      allowUnknown: true,
      stripUnknown: true
    },
    params: {
      userId: validator.userId.required()
    },
    payload: {
      fullName: validator.fullName.optional(),
      phoneNumber: validator.phoneNumber.optional(),
      // type: validator.type.default('chef').optional(),
      oldPassword: validator.password.optional(),
      newPassword: validator.password.optional()
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
      const payload = _.cloneDeep(request.payload);
      payload.id = request.params.userId;

      // Update password.
      if (payload.oldPassword) {
        const user = await UserModel.findOne(
          UserModel.buildCriteria('id', payload.id));

        if (user.verifyPassword(payload.oldPassword)) {
          if (payload.newPassword) {
            payload.encryptedPassword = payload.newPassword;
            delete payload.oldPassword;
            delete payload.newPassword;
            // TODO: Send back Fresh tokens for login. Ideally we should log out this guy.
          } else {
            return reply(Boom.unauthorized('Invalid credentials.'));
          }
        } else {
          return reply(Boom.unauthorized('Invalid credentials.'));
        }
      }

      const result = await UserModel.createOrUpdate(payload);

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
    path: '/api/users/{userId}',
    config: options
  };
  return details;
};

module.exports = {
  enabled: false,
  operation: handler
};
