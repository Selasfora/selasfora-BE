import Util from 'util';
import Boom from 'boom';
import Uuid from 'node-uuid';
import _ from 'lodash';
import UserModel from '../models/user';
import RedisClient from '../commons/redisClient';
import Constants from '../commons/constants';

const validator = UserModel.validatorRules();
const inspect = Util.inspect;

const options = {
  auth: Constants.AUTH.ALL,
  description: 'Login User - Access - ALL',
  tags: ['api'],
  validate: {
    payload: {
      email: validator.email.required(),
      password: validator.password.required()
    }
  },
  plugins: {
    'hapi-swagger': {
      responses: _.omit(Constants.API_STATUS_CODES, [201, 403])
    }
  },
  handler: async(request, reply) => {
    try {
      request.log(['info', __filename], `payload:: ${inspect(request.payload)}`);

      // eslint-disable-next-line max-len
      const user = await UserModel.findOne(UserModel.buildCriteria('email', request.payload.email));

      if (!user) {
        return reply(Boom.notFound('User does not exists'));
      }

      if (user.verifyPassword(request.payload.password)) {
        // on successful, create login_token for this user.
        const sessionId = Uuid.v4();
        const session = await request.server.asyncMethods.sessionsAdd(sessionId, {
          id: sessionId,
          userId: user.id
        });

        await RedisClient.saveSession(user.id, sessionId, session);
        // sign the token
        user.session_token = request.server.methods.sessionsSign(session);

        return reply(user);
      }

      return reply(Boom.unauthorized('Invalid credentials.'));
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
    path: '/api/users/login',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
