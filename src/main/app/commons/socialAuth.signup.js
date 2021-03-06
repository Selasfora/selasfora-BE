import Boom from 'boom';
import Uuid from 'node-uuid';
import Util, {
  inspect
} from 'util';
import Logger from 'winston';
import UserModel from '../models/user';
import SocialLoginModel from '../models/socialLogin';
import RedisClient from './redisClient';
import Social from './social';
import errorCodes from './errors';
import Constants from './constants';
import Shopify from './shopify';

const validator = UserModel.validatorRules();

async function handler(providerName, request, reply) {
  request.log(['info', `${providerName}.signup`], `payload:: ${inspect(request.payload)}`);

  const access_token = request.payload.access_token;
  const refresh_token = request.payload.refresh_token || access_token;

  const provider = new Social(providerName);
  let profile;
  try {
    profile = await provider.getProfile(access_token, refresh_token);
  } catch (e) {
    request.log(['error', `${providerName}.signup`], `fetch profile${e.stack}`);
    return reply(Boom.badRequest('Invalid social credentials'));
  }

  request.log(['info', `${providerName}.signup`], ` profile response:  ${inspect(profile)}`);

  const socialLogin = await SocialLoginModel.findOne([
    SocialLoginModel.buildCriteria('provider', providerName),
    SocialLoginModel.buildCriteria('provider_id', profile.id)
  ], {
    columns: '*,user.*'
  });

  // Is already registered with social login, error out.
  if (profile && socialLogin) {
    const user = await UserModel.findOne(
      UserModel.buildCriteria('id', socialLogin.user_id), {
        columns: '*,social_logins.*'
      }
    );

    request.log(['info', `${providerName}.signup`], `user found - ${inspect(user)}`);
    const sessionId = Uuid.v4();
    const session = await request.server.asyncMethods.sessionsAdd(sessionId, {
      id: sessionId,
      userId: user.id
    });
    await RedisClient.saveSession(user.id, sessionId, session);
    user.session_token = request.server.methods.sessionsSign(session);

    return reply(user);
  }

  const usersRegisteredUsingEmail = await UserModel.count(
    UserModel.buildCriteria('email', profile.email)
  );

  if (usersRegisteredUsingEmail > 0) {
    return reply(Boom.forbidden(Util.format(errorCodes.emailDuplicate, profile.email)));
  }

  let customer = {};
  try {
    const customer_details = {
      email: profile.email,
      first_name: profile.first_name
    };
    customer = await Shopify.customer.create(customer_details);
  } catch (err) {
    Logger.error('failed to persist the customer :: ', err);

    return reply(Boom.notFound('Failed to Create User'));
  }

  const userObject = {
    first_name: profile.first_name || Uuid.v4(),
    last_name: profile.last_name,
    email: profile.email,
    encrypted_password: Uuid.v4(),
    shopify_customer_id: customer.id
  };
  let user;
  try {
    user = await UserModel.createOrUpdate(userObject);

    const socialObject = {
      user_id: user.id,
      provider: providerName,
      provider_id: profile.id,
      access_token,
      refresh_token,
      is_primary_login: true
    };

    await SocialLoginModel.createOrUpdate(socialObject);
  } catch (e) {
    request.log(['error', `${providerName}.signup`], e);
    return reply(Boom.forbidden(e.message));
  }

  user = await UserModel.findOne(
    UserModel.buildCriteria('id', user.id), {
      columns: '*,social_logins.*'
    }
  );

  // on successful, create login_token for this user.
  const sessionId = Uuid.v4();
  const session = await request.server.asyncMethods.sessionsAdd(sessionId, {
    id: sessionId,
    userId: user.id
  });
  await RedisClient.saveSession(user.id, sessionId, session);

  // await Mailer.dispatchMail('welcome-email', 'admin@selasfora.com', user.email, {
  //   user
  // });

  user.session_token = request.server.methods.sessionsSign(session);
  return reply(user).code(201);
}

export default function socialSignUp(providerName) {
  const options = {
    auth: Constants.AUTH.ALL,
    description: `Login or Signup via ${providerName} - Access - ALL`,
    tags: ['api'],
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      payload: {
        access_token: validator.access_token.required(),
        refresh_token: validator.refresh_token.optional()
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
    handler: async (request, reply) => {
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
