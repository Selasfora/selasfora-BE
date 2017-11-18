import _ from 'lodash';
import Joi from 'joi';
import Util from 'util';
import Boom from 'boom';
import Constants from '../commons/constants';
import Shopify from '../commons/shopify';
import Translate from '@google-cloud/translate';
import Config from '../../config';

const inspect = Util.inspect;
const projectId = Config.get('translateApi').get('projectId');
const translate = new Translate({
  projectId
});

const options = {
  auth: Constants.AUTH.ALL,
  description: 'Get Translated Text',
  tags: ['api'],
  validate: {
    payload: {
      text: Joi.array().items(Joi.string())
        .description('comma-separated list of text')
        .required(),
      target: Joi.string().required().description('translate language'),
      format: Joi.string().optional().description('text or html;').default('html')
    }
  },
  plugins: {
    'hapi-swagger': {
      responses: _.omit(Constants.API_STATUS_CODES, [201])
    }
  },
  handler: async(request, reply) => {
    try {
      const options = {
        from: 'en',
        to: request.payload.target,
        format: request.payload.format || 'html'
      };

      const translations = await translate.translate(request.payload.text, options);
      return reply(translations);
    } catch (err) {
      request.log(['error', __filename], `handler failed: ${inspect(err)}`);
      return reply(Boom.notFound('Translation Failed'));
    }
  }
};

// eslint-disable-next-line no-unused-vars
const handler = (server) => {
  const details = {
    method: ['POST'],
    path: '/api/translate',
    config: options
  };
  return details;
};

module.exports = {
  enabled: true,
  operation: handler
};
