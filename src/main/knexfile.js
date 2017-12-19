/* eslint-disable import/no-extraneous-dependencies */
require('babel-register')();
const result = require('dotenv').config({
  path: __dirname + '/../../.env'
});
const Config = require('./config');

const databaseConfig = Config.get('database').get('postgres').toJS();
console.log('databaseConfig :: ', databaseConfig);
module.exports = {
  development: databaseConfig,
  staging: databaseConfig,
  production: databaseConfig,
  test: databaseConfig
};
