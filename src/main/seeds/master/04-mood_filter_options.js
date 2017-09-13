exports.seed = (knex, Promise) => {
  const records = [{
    name: 'Summer Staples'
  }, {
    name: 'Urban Summer'
  }, {
    name: 'Novel Romance'
  }, {
    name: 'Conscious Exclusive'
  }, {
    name: 'The Rule of Coo'
  }];

  return Promise.all([
    knex('mood_filter_options').del(),
    knex('mood_filter_options').insert(records)
  ]);
};
