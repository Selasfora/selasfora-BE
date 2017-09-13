import BaseModel from './base';

export default class ColorFilter extends BaseModel {
  static get tableName() {
    return 'color_filter_options';
  }
}
