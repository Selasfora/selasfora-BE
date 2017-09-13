import Util from 'util';
import Boom from 'boom';
import Path from 'path';
import Constants from '../commons/constants';

const inspect = Util.inspect;

// NOTE: Swagger documentation not needed.
const options = {
  auth: Constants.AUTH.ALL,
  description: 'robots.txt',
  handler: async(request, reply) => {
    try {
      return reply.file(Path.join(__dirname, '..', '..', 'public', 'robots.txt'));
    } catch (err) {
      request.log(['error', __filename], `handler failed: ${inspect(err)}`);
      return reply(Boom.wrap(err, 417));
    }
  }
};

// eslint-disable-next-line no-unused-vars
const handler = (server) => {
  const details = {
    method: ['GET'],
    path: '/robots.txt',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
