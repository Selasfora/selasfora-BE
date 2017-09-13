import BaseModel from './base';

export default class MoodFilter extends BaseModel {
  static get tableName() {
    return 'mood_filter_options';
  }
}
