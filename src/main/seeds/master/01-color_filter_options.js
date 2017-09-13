exports.seed = (knex, Promise) => {
  const records = [{
    name: 'red',
    code: '#FF0000'
  }, {
    name: 'cyan',
    code: '#00FFFF'
  }, {
    name: 'blue',
    code: '#0000FF'
  }, {
    name: 'dark blue',
    code: '#0000A0'
  }, {
    name: 'yellow',
    code: '#FFFF00'
  }];

  return Promise.all([
    knex('color_filter_options').del(),
    knex('color_filter_options').insert(records)
  ]);
};
