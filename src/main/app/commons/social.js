/* eslint-disable class-methods-use-this */
import querystring from 'querystring';
import request from 'request';
import Promise from 'bluebird';
import _ from 'lodash';
import Logger from 'winston';
import Config from '../../config';

export default class Social {
  constructor(provider) {
    this.provider = provider;
  }

  async request(path, fields) {
    const queryData = querystring.stringify(fields);
    const uri = `${path}?${queryData}`;
    return await new Promise((resolve, reject) => {
      request.get(uri, (err, response, body) => {
        if (err) return reject(err);
        if (!body) return reject(new Error(`No response from ${this.provider}`));
        const data = JSON.parse(body);
        if (data.error) return reject(data.error);
        return resolve(data);
      });
    });
  }

  getProfileDataFromFacebookProfile(profile) {
    return {
      ...profile,
      first_name: profile.name,
      avatarURL: `https://graph.facebook.com/${profile.id}/picture?type=large`
    };
  }

  getProfileDataFromGoogleProfile(profile) {
    return {
      ...profile,
      email: profile.emails[0].value,
      first_name: profile.displayName,
      userName: profile.displayName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(),
      avatarURL: _.get(profile, 'image.url')
    };
  }

  async getProfile(accesstToken, fields) {
    const {
      profileUrl
    } = Config.get('social').get(this.provider).toJS();
    const queries = {
      access_token: accesstToken
    };
    if (!_.isEmpty(fields)) {
      queries.fields = fields;
    }

    const profile = await this.request(profileUrl, queries);

    let profileData;
    if (this.provider === 'google') {
      profileData = this.getProfileDataFromGoogleProfile(profile);
    } else if (this.provider === 'facebook') {
      profileData = this.getProfileDataFromFacebookProfile(profile);
    } else if (this.provider === 'twitter') {
      // profileData = this.getProfileDataFromTwitterProfile(profile);
    }

    Logger.info('social profileData', profileData);
    // NOTE: In case we don't find the email, fake it.
    const email = profileData.email;
    if (!email) {
      const testEmail = profileData.first_name.replace(/[^a-zA-Z0-9]/g, '');
      const random = Math.floor(Math.random() * 90000) + 10000;
      Object.assign(profileData, {
        email: `${testEmail}${random}@selasfora.com`
      });
    }
    return profileData;
  }
}
