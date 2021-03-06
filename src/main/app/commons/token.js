import Logger from 'winston';
import UserRoles from '../models/userRole';

export default {
  // validate decoded token
  validateToken: async(decoded, request, next) => {
    try {
      // the request.server.methods.session is to obtain cached session in server
      // NOTE:: since this is getting called from config,
      // refrain to loading redisClient dynamically
      // eslint-disable-next-line global-require
      const redisClient = require('./redisClient');

      const session = await redisClient.getSession(decoded.subject.userId, decoded.id);

      Logger.info('validateToken : decoded : ', decoded);
      Logger.info('validateToken : session : ', session);

      // TODO: add checks for expiry..
      if (decoded.subject.userId === session.subject.userId) {
        // if the session exist, continue to next
        // eslint-disable-next-line global-require
        const UserModel = require('../models/user');

        const user = await UserModel.findOne(UserModel.buildCriteria('id', session.subject.userId), {
          columns: 'id'
        });

        // eslint-disable-next-line eqeqeq
        session.subject.scope = (user) ? UserRoles.USER : UserRoles.GUEST;
        Logger.info('validateToken : session.user.role :> ', session.subject.scope);
        next(null, true, session.subject);
      } else {
        next(null, false);
      }
    } catch (err) {
      Logger.error('validateToken err :: Invalid token found.');
      next(null, false);
    }
  }
};
