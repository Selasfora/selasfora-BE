exports.seed = (knex, Promise) => {
  const records = [{
    name: 'featured_jobs',
    value: '2,1'
  }];

  return Promise.all([
    knex('site_preferences').del(),
    knex('site_preferences').insert(records)
  ]);
};
