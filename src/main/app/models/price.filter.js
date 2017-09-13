import BaseModel from './base';

export default class PriceFilter extends BaseModel {
  static get tableName() {
    return 'price_filter_options';
  }
}
