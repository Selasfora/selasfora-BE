exports.seed = (knex, Promise) => {
  const records = [{
    name: 'Ceramic'
  }, {
    name: 'Metal'
  }];

  return Promise.all([
    knex('material_filter_options').del(),
    knex('material_filter_options').insert(records)
  ]);
};
