import BaseModel from './base';

export default class SortByFilter extends BaseModel {
  static get tableName() {
    return 'sort_by_options';
  }
}
