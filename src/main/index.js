/* eslint-disable no-console,import/imports-first */
require('dotenv').config();

console.log('process.env.DB_HOST :: > ', process.env.DB_HOST);

import knexClass from 'knex';
import Config from './config';
import Bootstrap from './app/bootstrap';
// Configure Winston Logger for logging in utils, models, etc.
// eslint-disable-next-line no-unused-vars
import Logger from './app/commons/logger';

// require('newrelic');
process.env.GOOGLE_APPLICATION_CREDENTIALS = require('path').join('./selasfora-d97563c10a5b.json');

console.log(Date.now(), '::: bootstraping ::::: ');
// create server instance
const server = Bootstrap.server(Config);

const configureDatabase = async() => {
  try {
    const dbConfig = Config.get('database').get('postgres').toJS();
    const knex = knexClass(dbConfig);

    await knex.raw(dbConfig.validateQuery);

    if (dbConfig.recreateDatabase === 'true') {
      console.log(Date.now(), '::: running database migration :::: started !!!');
      await knex.migrate.rollback(dbConfig);
      await knex.migrate.latest(dbConfig);

      // Populate Seed Data
      await knex.seed.run(dbConfig);
      // Flush all Redis keys...
      // eslint-disable-next-line global-require
      const RedisClient = require('./app/commons/redisClient');

      await RedisClient.flushDB();
      console.log(Date.now(), '::: running database migration :::: ended !!!');
    }
  } catch (e) {
    console.error('could not configure database: ', e);
    throw e;
  }
};

const start = async() => {
  try {
    // configure database.
    console.log(Date.now(), ':::: about to configure database ::::');
    await configureDatabase();

    // load all necessary plugins.
    console.log(Date.now(), ':::: loading server plugins ::::');
    await Bootstrap.plugins(server);

    // configure routes.
    console.log(Date.now(), ':::: loading server routes ::::');
    await Bootstrap.routes(server);

    // configure methods.
    console.log(Date.now(), ':::: loading server methods ::::');
    await Bootstrap.methods(server);

    /**
    start the server
    The if (!module.parent) {…} conditional makes sure that if the script is being
    required as a module by another script, we don’t start the server. This is done
    to prevent the server from starting when we’re testing it; with Hapi, we don’t
    need to have the server listening to test it.
    */
    if (!module.parent) {
      console.log(Date.now(), ':::: starting server ::::');
      await server.start();
      console.log(Date.now(), `${(server.settings.app.get('server').get('name'))} started at ${server.info.uri}`);
    }
  } catch (e) {
    console.error('could not start server: ', e);
    throw e;
  }
};

console.log(Date.now(), '::: booting up ::::: ');
start();
module.exports = server;
