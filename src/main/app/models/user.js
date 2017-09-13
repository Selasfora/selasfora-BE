/* eslint-disable class-methods-use-this,newline-per-chained-call */
import Bcrypt from 'bcrypt';
import Logger from 'winston';
import _ from 'lodash';
import Joi from 'joi';
import BaseModel from './base';

export default class User extends BaseModel {
  static get tableName() {
    return 'users';
  }

  static entityFilteringScope() {
    const filteredFields = ['encryptedPassword', 'passwordSalt', 'resetPasswordToken', 'resetPasswordSentAt', 'emailToken', 'isBlocked'];
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
      fullName: Joi.string().trim().min(3).max(255).description('Full Name'),
      userName: Joi.string().trim().lowercase().description('User Name'),
      password: Joi.string().trim().alphanum().min(1).max(30).description('Password'),
      type: Joi.string().trim().lowercase().default('chef')
        .valid(['chef', 'restaurant']).description('User Type'),
      accessToken: Joi.string().trim().description('Access token'),
      refreshToken: Joi.string().trim().description('Refresh token'),
      phoneNumber: Joi.string().trim().allow('', null).description('Phone Number'),
      resetPasswordToken: Joi.string().trim().description('Reset password token')
    };
    return rules;
  }

  presaveHook() {
    this.hashPassword();
  }

  static async findByUserNameOrEmail(email, userName) {
    const records = this.query()
      .where('email', _.toLower(email || userName))
      .orWhere('userName', _.toLower(userName || email));

    return await records;
  }

  static async findByTypeAndNameOrId(type, name, id) {
    const records = this.query()
      .where({
        type
      })
      .andWhere((builder) => {
        builder.where('id', id).orWhere('userName', _.toLower(name));
      });

    return await records;
  }

  static get relationMappings() {
    return {
      socialLogins: {
        relation: BaseModel.HasManyRelation,
        modelClass: `${__dirname}/socialLogin`,
        join: {
          from: 'users.id',
          to: 'social_logins.userId'
        }
      }
    };
  }

  hashPassword() {
    if (this.encryptedPassword) {
      if (this.encryptedPassword.indexOf('$2a$') === 0 && this.encryptedPassword.length === 60) {
        // The password is already hashed. It can be the case when the instance is loaded from DB
        this.encryptedPassword = this.encryptedPassword;
      } else {
        this.passwordSalt = Bcrypt.genSaltSync(10);
        this.encryptedPassword = this.encryptPassword(this.encryptedPassword, this.passwordSalt);
      }
    }
    Logger.info('after hashPassword');
  }

  verifyPassword(password) {
    return this.encryptPassword(password, this.passwordSalt) === this.encryptedPassword;
  }

  encryptPassword(pwd, passwordSalt) {
    return Bcrypt.hashSync(pwd, passwordSalt);
  }
}
