exports.seed = (knex, Promise) => {
  const records = [{
    range: '49 - 99'
  }, {
    range: '149 - 199'
  }, {
    range: '249 - 300'
  }];

  return Promise.all([
    knex('price_filter_options').del(),
    knex('price_filter_options').insert(records)
  ]);
};
