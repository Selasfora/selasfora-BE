import BaseModel from './base';

export default class ContactUs extends BaseModel {
  static get tableName() {
    return 'contact_us';
  }
}
