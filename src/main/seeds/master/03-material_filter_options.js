exports.seed = (knex, Promise) => {
  const records = [{
    name: 'Silver'
  }, {
    name: 'Ceramic'
  }, {
    name: 'Metallic'
  }, {
    name: 'Chrome'
  }];

  return Promise.all([
    knex('material_filter_options').del(),
    knex('material_filter_options').insert(records)
  ]);
};
