import Util from 'util';
import _ from 'lodash';
import Boom from 'boom';
import Logger from 'winston';
import errorCodes from '../commons/errors';

export default function checkIfExists(model, modelName, keys, valuePaths) {
  const testExistance = async(request, reply, next) => {
    Logger.info(__filename, 'entry :: (modelName, keys, valuePaths) :: ', modelName, keys, valuePaths);
    let exists = false;
    try {
      // prerequisties - keys and valuePath count should be same
      const conditions = [];
      if (_.size(keys) > 0 &&
        _.size(valuePaths) > 0 &&
        _.size(keys) === _.size(valuePaths)) {
        _.each(_.zipObject(keys, valuePaths), (valuePath, key) => {
          const value = _.hasIn(request, valuePath) ? _.get(request, valuePath) : valuePath;
          // Handle In clause..
          if (_.endsWith(key, '.in')) {
            const criteria = model.buildCriteria(key.replace('.in', ''), _.compact(_.words(value, /[^, ]+/g)), 'in');
            conditions.push(criteria);
          } else {
            const criteria = model.buildCriteria(key, value);
            conditions.push(criteria);
          }
        });

        const count = await model.count(conditions);
        exists = (count > 0);
      }
    } catch (err) {
      Logger.error(__filename, 'exit :: ', err);
    }

    Logger.info(__filename, 'exit :: (modelName, keys, valuePaths) :: success :: ', exists);
    next(exists ? null : Boom.notFound(Util.format(errorCodes.notFound, modelName)), exists);
  };

  testExistance.applyPoint = 'onPreHandler';
  return testExistance;
}
