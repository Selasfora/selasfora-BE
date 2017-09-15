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
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASS,
      partition: 'cache'
    }]
  },
  // NewRelic Config
  newrelic: {
    name: `Selasfora v1.0 Server -  ${env}`,
    key: process.env.NEW_RELIC_LICENSE_KEY,
    log_level: process.env.NEW_RELIC_LOG_LEVEL
  },
  // Database, currently we have postgres only,
  // mongo will be added later and redis is used for cache.
  database: {
    postgres: {
      client: 'postgresql',
      debug: true,
      recreateDatabase: (env !== 'production') ? (process.env.DB_RECREATE || 'false') : 'false',
      connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        ssl: true,
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
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASS
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
    verificationUrl: `${process.env.WEB_APP_URL || 'http://localhost:8081/api/users'}/verifyEmail`,
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
  // social Credentials
  social: {
    facebook: {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET
    },
    google: {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
    twitter: {
      consumerKey: process.env.TWITTER_KEY,
      consumerSecret: process.env.TWITTER_SECRET
    }
  },
  mailer: {
    transport: 'sendgrid',
    // Sendgrid credentials
    sendgrid: {
      package: 'nodemailer-sendgrid-transport',
      auth: {
        api_key: process.env.SENDGRID_API_KEY
      }
    }
  },
  shopify: {
    shopName: process.env.SHOPIFY_SHOP_NAME,
    apiKey: process.env.SHOPIFY_API_KEY,
    password: process.env.SHOPIFY_PASSWORD
  }
};

/* eslint-enable no-process-env */
export default immutable.fromJS(config);
