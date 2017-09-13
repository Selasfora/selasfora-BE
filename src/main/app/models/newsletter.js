import BaseModel from './base';

export default class Newsletter extends BaseModel {
  static get tableName() {
    return 'newsletters';
  }
}
