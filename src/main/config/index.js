/* eslint-disable no-console,import/imports-first */
require('dotenv').config();

console.log('Config :: process.env.DB_HOST :: > ', process.env.DB_HOST);

import CatboxRedis from 'catbox-redis';
import path from 'path';
import immutable from 'immutable';
import token from '../app/commons/token';

const env = process.env.NODE_ENV || 'development';

const config = {
  // env info
  env,
  // Server options used to start Hapi server
  server: {
    name: 'Selasfora v1.0 Server',
    version: '1.0.0',
    port: process.env.PORT || 8081,
    cache: [{
      engine: CatboxRedis,
      name: 'redis-cache',
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASS || false,
      partition: 'cache'
    }]
  },
  // NewRelic Config
  newrelic: {
    name: `Selasfora v1.0 Server -  ${env}`,
    key: process.env.NEW_RELIC_LICENSE_KEY || 'disabled',
    log_level: process.env.NEW_RELIC_LOG_LEVEL || 'info'
  },
  // Database, currently we have postgres only,
  // mongo will be added later and redis is used for cache.
  database: {
    postgres: {
      client: 'postgresql',
      debug: true,
      recreateDatabase: (env !== 'production') ? (process.env.DB_RECREATE || 'false') : 'false',
      connection: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'manjunathan',
        password: process.env.DB_PASS || 'password',
        database: process.env.DB_NAME || 'selasfora_dev',
        charset: 'utf8'
      },
      pool: {
        min: 2,
        max: 10
      },
      validateQuery: 'SELECT 1',
      migrations: {
        directory: path.join(__dirname, '..', 'migrations')
      },
      seeds: {
        directory: path.join(__dirname, '..', 'seeds', 'master')
      }

      // IMPORTANT :: Commenting out acquireConnectionTimeout
      //    - https://github.com/tgriesser/knex/issues/1382#issuecomment-217020465
      // acquireConnectionTimeout: 10000
    },
    redis: {
      name: 'selasfora-cache',
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASS || false
    }
  },
  // Forgot password configureation
  passwordReset: {
    duration: 60 * 60 * 24 * 1000,
    tokenSecretkey: process.env.AUTH_JWT_PWD_KEY || 'NeverShareYourSecret',
    forgotUrl: `${process.env.WEB_APP_URL || 'http://localhost:3000'}/password-reset`,
    fromEmail: process.env.SUPPORT_FROM_EMAIL || 'support@selasfora.com'
  },
  // Forgot password configureation
  emailVerification: {
    verificationUrl: `${process.env.WEB_APP_URL || 'http://localhost:3000'}/verifyEmail`,
    fromEmail: process.env.SUPPORT_FROM_EMAIL || 'support@selasfora.com'
  },
  // auth-jwt strategy for sesssion.
  auth: {
    key: process.env.AUTH_JWT_KEY || 'NeverShareYourSecret', // Never Share your secret key
    validateFunc: token.validateToken, // validate function defined above
    verifyOptions: {
      ignoreExpiration: true, // do not reject expired tokens
      algorithms: ['HS256'] // pick a strong algorithm
    },
    urlKey: false,
    cookieKey: false
  },
  // social Credentils
  social: {
    facebook: {
      clientID: process.env.FACEBOOK_CLIENT_ID || '635916939929504',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '3894fb51915debb96a3309a3bc164831',
      profileUrl: 'https://graph.facebook.com/me'
    },
    google: {
      clientID: process.env.GOOGLE_CLIENT_ID || '128848880503-d78qq6ut9hkrdci543c43ka1ehr3vph4.apps.googleusercontent.com',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'pT1LZuRvVVI0hVCOrizdaCU1',
      profileUrl: 'https://www.googleapis.com/plus/v1/people/me'
    }
  },
  mailer: {
    transport: 'ses',
    // SES credentials
    ses: {
      package: 'nodemailer-ses-transport',
      accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID || 'AKIAIU536CCJVDN3TWMA',
      secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY || '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',
      region: process.env.AWS_SES_REGION || 'us-west-2'
    }
  }
};

/* eslint-enable no-process-env */
export default immutable.fromJS(config);
