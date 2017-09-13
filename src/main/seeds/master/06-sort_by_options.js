exports.seed = (knex, Promise) => {
  const records = [{
    name: 'Newest'
  }, {
    name: 'Highest Price'
  }, {
    name: 'Lowest Price'
  }];

  return Promise.all([
    knex('sort_by_options').del(),
    knex('sort_by_options').insert(records)
  ]);
};
