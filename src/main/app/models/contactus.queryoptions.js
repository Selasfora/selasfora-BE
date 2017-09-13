import BaseModel from './base';

export default class ContactUsQueryModel extends BaseModel {
  static get tableName() {
    return 'contact_us_query_options';
  }
}
