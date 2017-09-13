exports.seed = (knex, Promise) => {
  const records = [{
    name: 'My order'
  }, {
    name: 'Delivery'
  }, {
    name: 'Returns and Refunds'
  }, {
    name: 'My account'
  }, {
    name: 'A product question'
  }, {
    name: 'Other'
  }];

  return Promise.all([
    knex('contact_us_query_options').del(),
    knex('contact_us_query_options').insert(records)
  ]);
};
