/* eslint-disable class-methods-use-this,newline-per-chained-call */
import Bcrypt from 'bcryptjs';
import Logger from 'winston';
import BaseJoi from 'joi';
import Extension from 'joi-date-extensions';
import BaseModel from './base';

const Joi = BaseJoi.extend(Extension);

export default class User extends BaseModel {
  static get tableName() {
    return 'users';
  }

  static entityFilteringScope() {
    const filteredFields = ['dob', 'encrypted_password', 'password_salt', 'confirmation_token', 'confirmed_at', 'confirmation_sent_at', 'reset_password_token', 'reset_password_sent_at', 'social_logins'];
    return {
      admin: filteredFields,
      user: filteredFields,
      guest: filteredFields
    };
  }

  static validatorRules() {
    const rules = {
      userId: Joi.number().integer().positive().description('User Id'),
      email: Joi.string().trim().lowercase().email({
        minDomainAtoms: 2
      }).description('Email'),
      first_name: Joi.string().trim().min(1).max(255).description('First Name'),
      last_name: Joi.string().trim().min(1).max(255).description('Last Name'),
      password: Joi.string().trim().alphanum().min(1).max(30).description('Password'),
      access_token: Joi.string().trim().description('Access token'),
      refresh_token: Joi.string().trim().description('access_token in case of facebook; refresh_token in case of Google ; token_secret in case of twitter'),
      phone: Joi.number().integer().allow('', null).description('Phone Number'),
      reset_password_token: Joi.string().trim().description('Reset password token'),
      gender: Joi.string().trim().allow('', null).valid(['M', 'F', 'U']).default('U').description('Gender'),
      dob: Joi.date().format('YYYY-MM-DD').description('DOB Format - YYYY-MM-DD')
    };
    return rules;
  }

  presaveHook() {
    this.hashPassword();
  }

  static get relationMappings() {
    return {
      social_logins: {
        relation: BaseModel.HasManyRelation,
        modelClass: `${__dirname}/socialLogin`,
        join: {
          from: 'users.id',
          to: 'social_logins.user_id'
        }
      }
    };
  }

  hashPassword() {
    if (this.encrypted_password) {
      if (this.encrypted_password.indexOf('$2a$') === 0 && this.encrypted_password.length === 60) {
        // The password is already hashed. It can be the case when the instance is loaded from DB
        this.encrypted_password = this.encrypted_password;
      } else {
        this.password_salt = Bcrypt.genSaltSync(10);
        this.encrypted_password = this.encryptPassword(this.encrypted_password, this.password_salt);
      }
    }
    Logger.info('after hashPassword');
  }

  verifyPassword(password) {
    return this.encryptPassword(password, this.password_salt) === this.encrypted_password;
  }

  encryptPassword(pwd, password_salt) {
    return Bcrypt.hashSync(pwd, password_salt);
  }
}
