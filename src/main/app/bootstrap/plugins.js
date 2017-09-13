import _ from 'lodash';
import toposort from 'toposort';
import requireDirs from 'require-dir';
import Promise from 'bluebird';

// configure plugins - list of plugins will be loaded from plugins folder.
module.exports = async(server) => {
  const plugins = requireDirs('../plugins');
  const enabledPlugins = _.filter(plugins, ['enabled', true]);

  const modules = {};
  _.each(enabledPlugins, (plugin) => {
    modules[plugin.name] = plugin;
  });

  // get all module name as key, which equal to node of vector graph
  const nodes = _.keys(modules);
  const edges = _.reduce(modules, (result, plugin, name) => {
    _.each(plugin.require, requirePlugin => result.push([name, requirePlugin]));
    return result;
  }, []);

  const serverRegister = Promise.promisify(server.register, {
    context: server,
    multiArgs: true
  });

  // do topological sort to make sure the order is right and exports
  const enabledPluginsTmp = _.map(_(
    toposort.array(nodes, edges)).reverse().value(), name => modules[name]);

  return Promise.each(enabledPluginsTmp, async(_plugin) => {
    server.log(['info', 'bootup'], `registering plugin - ${_plugin.name}`);
    const err = await serverRegister(_plugin.plugin);
    if (!_.isEmpty(err)) {
      server.log(['error', 'bootup'], `failed registering plugin - ${_plugin.name} - ${err}`);
      throw err;
    }

    if (_plugin.callback && _.isFunction(_plugin.callback)) {
      server.log(['info', 'bootup'], `Invoking plugin.callback - ${_plugin.name}`);
      await _plugin.callback(server);
    } else {
      server.log(['info', 'bootup'], `Installed plugin - ${_plugin.name}`);
    }
    return true;
  });
};
