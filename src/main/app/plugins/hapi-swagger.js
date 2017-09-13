import HapiSwagger from 'hapi-swagger';

const plugin = {
  enabled: true,
  name: 'hapi-swagger',
  plugin: {
    register: HapiSwagger,
    options: {
      basePath: '/api/',
      info: {
        title: 'Selasfora v1.0 REST API Docs',
        description: 'Selasfora v1.0 REST API Docs',
        version: '1.0.0'
      },
      securityDefinitions: {
        jwt: {
          type: 'apiKey',
          name: 'Authorization',
          // eslint-disable-next-line quote-props
          'in': 'header'
        }
      },
      pathPrefixSize: 2,
      payloadType: 'json',
      produces: ['application/vnd.selasfora.v1+json', 'application/json'],
      consumes: ['application/vnd.selasfora.v1+json', 'application/json']
    }
  },
  require: ['good', 'inert', 'vision']
};

module.exports = plugin;
