exports.seed = (knex, Promise) => {
  const records = [{
    name: 'Party'
  }, {
    name: 'Date night'
  }, {
    name: 'Romantic'
  }];

  return Promise.all([
    knex('mood_filter_options').del(),
    knex('mood_filter_options').insert(records)
  ]);
};
