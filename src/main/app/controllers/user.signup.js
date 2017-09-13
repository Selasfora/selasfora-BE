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
    payload: {
      email: validator.email.required(),
      password: validator.password.required(),
      password_confirmation: validator.password.required(),
      phone: validator.phone.optional(),
      first_name: validator.first_name.required(),
      last_name: validator.last_name.required()
    }
  },
  plugins: {
    'hapi-swagger': {
      responses: _.omit(Constants.API_STATUS_CODES, [200])
    }
  },
  handler: async(request, reply) => {
    try {
      if (request.payload.password !== request.payload.password_confirmation) {
        return reply(Boom.notFound('Password confirmation doesn\'t match Password'));
      }

      const user = await UserModel.findOne(UserModel.buildCriteria('email', request.payload.email));

      // Error out if email already exists.
      if (!user) {
        return reply(Boom.notFound('Email has already been taken'));
      }

      const userObject = _.clone(request.payload);
      userObject.encrypted_password = request.payload.password;
      delete userObject.password;
      userObject.confirmation_token = Math.floor(100000 + (Math.random() * 900000));
      userObject.confirmation_sent_at = new Date();
      const result = await UserModel.createOrUpdate(userObject);

      // TODO: Link the Account to Shopify and store back the shopify_customer_id.

      // on successful, create login_token for this user.
      const sessionId = Uuid.v4();
      const session = await request.server.asyncMethods.sessionsAdd(sessionId, {
        id: sessionId,
        userId: result.id
      });

      await RedisClient.saveSession(result.id, sessionId, session);
      // sign the token
      result.session_token = request.server.methods.sessionsSign(session);

      // Construct web app url for email verification
      const verificationUrl = `${Config.get('emailVerification').get('verificationUrl')}?email=${result.email}&verificationCode=${result.confirmation_token}`;

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
