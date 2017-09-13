import _ from 'lodash';
import requireDirs from 'require-dir';

// configure routes - routes will be picked from ./controllers folder.
module.exports = async(server) => {
  const routes = [];
  const controllers = requireDirs('../controllers');

  const enabledRoutes = _.filter(controllers, ['enabled', true]);
  _.each(enabledRoutes, (controller) => {
    const operation = controller.operation;
    if (_.isFunction(operation)) {
      const func = operation(server);
      let policies = _.get(func, 'config.plugins.policies');
      if (!policies) {
        _.set(func, 'config.plugins.policies', []);
        policies = _.get(func, 'config.plugins.policies');
      }

      policies.push('entityFilter');
      policies.push('boomResponseHandler');
      routes.push(func);
    }
  });

  server.route(routes);
};
