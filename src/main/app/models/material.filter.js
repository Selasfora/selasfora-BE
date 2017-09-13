import BaseModel from './base';

export default class MaterialFilter extends BaseModel {
  static get tableName() {
    return 'material_filter_options';
  }
}
