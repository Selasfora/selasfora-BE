/* eslint-disable class-methods-use-this,no-underscore-dangle,no-unreachable */
// import querystring from 'querystring';
// import request from 'request';
// import Promise from 'bluebird';
// import _ from 'lodash';
import Logger from 'winston';
import FacebookTokenStrategy from 'passport-facebook-token';
import TwitterTokenStrategy from 'passport-twitter-token';
import Config from '../../config';

const GoogleTokenStrategy = require('passport-google-token').Strategy;

const socialConfig = Config.get('social').toJS();
const callback = (token, tokenSecret, profile, done) => {}; // eslint-disable-line no-unused-vars

const FacebookStrategy = new FacebookTokenStrategy(socialConfig.facebook, callback);
const GoogleStrategy = new GoogleTokenStrategy(socialConfig.google, callback);
const TwitterStrategy = new TwitterTokenStrategy(socialConfig.twitter, callback);

export default class Social {
  constructor(provider) {
    this.provider = provider;
  }

  async fetchProfile(params) {
    switch (this.provider) {
      case 'twitter':
        return await new Promise((resolve, reject) => {
          TwitterStrategy.userProfile(params.access_token, params.token_secret, {}, (err, response) => { // eslint-disable-line max-len
            if (err) return reject(new Error(`No response from ${this.provider}`));
            return resolve(response);
          });
        });
        break;
      case 'facebook':
        return await new Promise((resolve, reject) => {
          FacebookStrategy.userProfile(params.access_token, (err, response) => {
            if (err) return reject(new Error(`No response from ${this.provider}`));
            return resolve(response);
          });
        });
        break;
      case 'google':
        return await new Promise((resolve, reject) => {
          GoogleStrategy.userProfile(params.access_token, (err, response) => {
            if (err) return reject(new Error(`No response from ${this.provider}`));
            return resolve(response);
          });
        });
        break;
      default:
        throw new Error(`No response from ${this.provider}`);
        break;
    }
  }

  getProfileData(data) {
    let returnValue;
    switch (this.provider) {
      case 'twitter':
        returnValue = {
          first_name: data.displayName,
          id: data.id,
          last_name: data.last_name,
          gender: data.gender,
          email: data.emails[0].value,
          provider: data.provider
        };
        break;
      case 'facebook':
        returnValue = {
          first_name: data._json.first_name,
          last_name: data._json.last_name,
          id: data.id,
          gender: data.gender,
          email: data.emails[0].value,
          provider: data.provider
        };
        break;
      case 'google':
        returnValue = {
          first_name: data._json.given_name,
          last_name: data._json.family_name,
          id: data.id,
          gender: data.gender,
          email: data.emails[0].value,
          provider: data.provider
        };
        break;
      default:
        break;
    }
    return returnValue;
  }

  async getProfile(accesstToken, tokenSecret) {
    const queries = {
      access_token: accesstToken,
      token_secret: tokenSecret
    };

    const profile = await this.fetchProfile(queries);
    const profileData = this.getProfileData(profile);

    Logger.info('social profileData', profileData);
    // NOTE: In case we don't find the email, fake it.
    if (profileData && !profileData.email) {
      const testEmail = profileData.first_name.replace(/[^a-zA-Z0-9]/g, '');
      const random = Math.floor(Math.random() * 90000) + 10000;
      profileData.email = `${testEmail}${random}@selasfora.com`;
    }

    if (profileData && !profileData.gender) {
      profileData.gender = undefined;
    }

    return profileData;
  }
}
