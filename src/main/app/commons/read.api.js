/* eslint-disable no-unused-vars */
import Util from 'util';
import Joi from 'joi';
import _ from 'lodash';
import Boom from 'boom';
import dbUtil from './dbUtil';
import UserRole from '../models/userRole';
import Constants from './constants';

const inspect = Util.inspect;

async function readHandler(model, request, reply) {
  const criteriaOpts = {
    columns: _.compact(_.words(request.query.fields, /[^, ]+/g))
  };

  const filterOpts = dbUtil.fetchFilterCriteria(request.query.filters);
  const count = await model.count(_.cloneDeep(filterOpts));
  const items = await model.findAll(_.cloneDeep(filterOpts), criteriaOpts);

  return reply({
    count,
    items
  });
}

export default function readAPI(pathPrefix, params, model) {
  const options = {
    auth: params.auth || false,
    description: `Get ${pathPrefix} - Access - ${params.auth ? params.auth.scope : 'ALL'}`,
    notes: `Get ${pathPrefix} - Allowed Access - ${params.auth ? params.auth.scope : 'ALL'}`,
    tags: ['api'],
    validate: {
      params: params.pathParams,
      query: _.assign({}, {
        fields: Joi.string().trim().description('Fields').optional(),
        filters: Joi.string().trim().description('Field filters').optional()
      }, params.queryParams ? params.queryParams : {})
    },
    plugins: {
      'hapi-swagger': {
        responses: _.omit(Constants.API_STATUS_CODES, [201])
      },
      policies: params.policies || []
    },
    handler: async(request, reply) => {
      try {
        return await readHandler(model, request, reply);
      } catch (err) {
        request.log(['error', `read.api.${pathPrefix}`], `handler failed: ${inspect(err)}`);
        if (err.isBoom) {
          return reply(err);
        }
        return reply(Boom.badImplementation(err.message));
      }
    }
  };

  return () => ({
    method: ['GET'],
    path: `/api/${pathPrefix}`,
    config: options
  });
}
