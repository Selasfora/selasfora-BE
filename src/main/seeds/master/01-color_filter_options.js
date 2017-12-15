exports.seed = (knex, Promise) => {
  const records = [{
    name: 'Red',
    code: '#FF0000'
  }, {
    name: 'Blue',
    code: '#0000FF'
  }, {
    name: 'Green',
    code: '#00FF00'
  }, {
    name: 'Purple',
    code: '#800080'
  }, {
    name: 'White',
    code: '#FFFFFF'
  }];

  return Promise.all([
    knex('color_filter_options').del(),
    knex('color_filter_options').insert(records)
  ]);
};
