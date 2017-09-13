import Boom from 'boom';
import Uuid from 'node-uuid';
import Util, {
  inspect
} from 'util';
import UserModel from '../models/user';
import SocialLoginModel from '../models/socialLogin';
import RedisClient from './redisClient';
import Social from './social';
import errorCodes from './errors';
import Constants from './constants';

const validator = UserModel.validatorRules();

async function handler(providerName, request, reply) {
  request.log(['info', `${providerName}.signup`], `payload:: ${inspect(request.payload)}`);

  const accessToken = request.payload.accessToken;
  const refreshToken = request.payload.refreshToken || accessToken;

  const provider = new Social(providerName);
  let profile;
  try {
    profile = await provider.getProfile(accessToken);
  } catch (e) {
    request.log(['error', `${providerName}.signup`], `fetch profile${e.stack}`);
    return reply(Boom.badRequest('Invalid social credentials'));
  }

  request.log(['info', `${providerName}.signup`], ` prfile response:  ${inspect(profile)}`);

  const socialLogin = await SocialLoginModel.findOne([
    SocialLoginModel.buildCriteria('provider', providerName),
    SocialLoginModel.buildCriteria('providerId', profile.id)
  ], {
    columns: '*,user.*'
  });

  // Is already registered with social login, error out.
  if (profile && socialLogin) {
    const user = await UserModel.findOne(
      UserModel.buildCriteria('id', socialLogin.userId), {
        columns: '*,socialLogins.*'
      }
    );

    // Error out if the user type doesnt match
    if (user.type !== request.payload.type) {
      return reply(Boom.unauthorized('Invalid credentials.'));
    }

    if (user.isBlocked === true) {
      return reply(Boom.unauthorized('Blocked User.'));
    }

    request.log(['info', `${providerName}.signup`], `user found - ${inspect(user)}`);
    const sessionId = Uuid.v4();
    const session = await request.server.asyncMethods.sessionsAdd(sessionId, {
      id: sessionId,
      userId: user.id,
      type: user.type
    });
    await RedisClient.saveSession(user.id, sessionId, session);
    user.sessionToken = request.server.methods.sessionsSign(session);

    return reply(user);
  }

  const usersRegisteredUsingEmail = await UserModel.count(
    UserModel.buildCriteria('email', profile.email)
  );

  if (usersRegisteredUsingEmail > 0) {
    return reply(Boom.forbidden(Util.format(errorCodes.emailDuplicate, profile.email)));
  }

  const userObject = {
    userName: profile.userName || Uuid.v4(),
    fullName: profile.fullName,
    email: profile.email,
    encryptedPassword: Uuid.v4(),
    type: request.payload.type
  };
  let user;
  try {
    user = await UserModel.createOrUpdate(userObject);

    const socialObject = {
      userId: user.id,
      provider: providerName,
      providerId: profile.id,
      accessToken,
      refreshToken,
      isPrimaryLogin: true
    };

    await SocialLoginModel.createOrUpdate(socialObject);
  } catch (e) {
    request.log(['error', `${providerName}.signup`], e);
    return reply(Boom.forbidden(e.message));
  }

  user = await UserModel.findOne(
    UserModel.buildCriteria('id', user.id), {
      columns: '*,socialLogins.*'
    }
  );

  // on successful, create login_token for this user.
  const sessionId = Uuid.v4();
  const session = await request.server.asyncMethods.sessionsAdd(sessionId, {
    id: sessionId,
    userId: user.id,
    type: user.type
  });
  await RedisClient.saveSession(user.id, sessionId, session);

  // await Mailer.dispatchMail('welcome-email', 'admin@selasfora.com', user.email, {
  //   user
  // });

  user.sessionToken = request.server.methods.sessionsSign(session);
  return reply(user).code(201);
}

export default function socialSignUp(providerName) {
  const options = {
    auth: Constants.AUTH.ALL,
    description: `Login or Signup via ${providerName} - Access - ALL`,
    tags: ['api'],
    validate: {
      payload: {
        accessToken: validator.accessToken.required(),
        refreshToken: validator.refreshToken.optional(),
        type: validator.type.default('chef').optional()
      }
    },
    plugins: {
      'hapi-swagger': {
        responses: {
          201: {
            description: 'Created user successfully.'
          },
          400: {
            description: 'Malformed request, check email,userName,accessToken and refreshToken are provided.'
          },
          403: {
            description: `Could not signup user because some of the fields (email or username, ${providerName}) already be added.`
          },
          500: {
            description: 'The server encountered an unexpected condition which prevented it from fulfilling the request.'
          }
        }
      }
    },
    handler: async(request, reply) => {
      try {
        return await handler(providerName, request, reply);
      } catch (err) {
        request.log(['error', `${providerName}.signup`], `handler failed: ${inspect(err)}`);
        if (err.isBoom) {
          return reply(err);
        }
        return reply(Boom.badImplementation(err.message));
      }
    }
  };

  return () => ({
    method: ['POST'],
    path: `/api/users/signup/${providerName}`,
    config: options
  });
}
