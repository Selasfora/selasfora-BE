exports.seed = (knex, Promise) => {
  const records = [{
    name: 'less than 35',
    range: '0 - 35'
  }, {
    name: '35 to 50',
    range: '35 - 50'
  }, {
    name: '50 to 100',
    range: '50 - 100'
  }, {
    name: '100+',
    range: '100 - 100000000000'
  }];

  return Promise.all([
    knex('price_filter_options').del(),
    knex('price_filter_options').insert(records)
  ]);
};
