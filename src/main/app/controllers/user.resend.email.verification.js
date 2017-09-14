import Boom from 'boom';
import _ from 'lodash';
import UserModel from '../models/user';
import Constants from '../commons/constants';
import Mailer from '../commons/mailer';
import Config from '../../config';

const validator = UserModel.validatorRules();
const options = {
  auth: Constants.AUTH.ALL,
  description: 'Resend Verify Email Token  - Access - ALL',
  tags: ['api'],
  validate: {
    query: {
      email: validator.email.required()
    }
  },
  plugins: {
    'hapi-swagger': {
      responses: _.omit(Constants.API_STATUS_CODES, [200])
    }
  },
  handler: async(request, reply) => {
    // Fetch user with provided email
    let user = await UserModel.findOne(UserModel.buildCriteria('email', request.query.email));
    if (!user) {
      return reply(Boom.notFound('User Not Found'));
    }

    // Generate Verification token
    user.confirmation_token = Math.floor(100000 + (Math.random() * 900000));
    user.confirmation_sent_at = new Date();
    user = await UserModel.createOrUpdate(user);

    // Construct web app url for email verification
    const verificationUrl = `${Config.get('emailVerification').get('verificationUrl')}?email=${user.email}&verification_code=${user.confirmation_token}`;

    await Mailer.dispatchMail('welcome-email', 'admin@selasfora.com', user.email, {
      user,
      verificationUrl
    });
    return reply(Constants.SUCCESS_RESPONSE);
  }
};

const handler = () => {
  const details = {
    method: ['GET'],
    path: '/api/users/confirmation',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};