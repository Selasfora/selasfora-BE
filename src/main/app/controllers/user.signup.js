import Util from 'util';
import Boom from 'boom';
import _ from 'lodash';
import Uuid from 'node-uuid';
import UserModel from '../models/user';
import RedisClient from '../commons/redisClient';
import Constants from '../commons/constants';
import Mailer from '../commons/mailer';
import Config from '../../config';

const inspect = Util.inspect;
const validator = UserModel.validatorRules();
const options = {
  auth: Constants.AUTH.ALL,
  description: 'Create User - Access - ALL',
  tags: ['api'],
  validate: {
    options: {
      allowUnknown: true,
      stripUnknown: true
    },
    payload: {
      userName: validator.userName.required(),
      fullName: validator.fullName.required(),
      password: validator.password.required(),
      email: validator.email.required(),
      type: validator.type.default('chef').optional()
    }
  },
  plugins: {
    'hapi-swagger': {
      responses: _.omit(Constants.API_STATUS_CODES, [200])
    }
  },
  handler: async(request, reply) => {
    try {
      const userCount = await UserModel.findByUserNameOrEmail(
        request.payload.email, request.payload.userName);

      // Error out if email already exists.
      if (_.size(userCount) > 0) {
        return reply(Boom.notFound('The email/username already taken'));
      }

      const userObject = _.clone(request.payload);
      userObject.encryptedPassword = request.payload.password;
      delete userObject.password;
      userObject.emailToken = Math.floor(100000 + (Math.random() * 900000));
      const result = await UserModel.createOrUpdate(userObject);

      // on successful, create login_token for this user.
      const sessionId = Uuid.v4();
      const session = await request.server.asyncMethods.sessionsAdd(sessionId, {
        id: sessionId,
        userId: result.id,
        type: result.type
      });

      await RedisClient.saveSession(result.id, sessionId, session);
      // sign the token
      result.sessionToken = request.server.methods.sessionsSign(session);

      // Construct web app url for email verification
      const verificationUrl = `${Config.get('emailVerification').get('verificationUrl')}?email=${result.email}&verificationCode=${result.emailToken}`;

      await Mailer.dispatchMail('welcome-email', 'admin@selasfora.com', result.email, {
        user: result,
        verificationUrl
      });
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
    path: '/api/users',
    config: options
  };
  return details;
};

module.exports = {
  enabled: false,
  operation: handler
};
