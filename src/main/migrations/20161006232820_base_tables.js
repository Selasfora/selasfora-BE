/* eslint-disable no-console */
import Bcrypt from 'bcrypt';

exports.up = function up(knex, Promise) {
  return Promise.all([
    /**
    Table:  Users
    Purpose: Store User's Data.
    */
    knex.schema.createTableIfNotExists('users', (table) => {
      table.increments('id').primary();

      // Details
      table.string('email', 100).index().notNullable().unique()
        .comment('Email in lowercase');
      table.string('first_name', 255).comment('First Name');
      table.string('last_name', 255).comment('Last Name');

      // Password and Salt
      table.string('encrypted_password').notNullable().comment('Encrypted password');
      table.string('password_salt').notNullable().comment('Password Salt');

      table.string('phone', 15).comment('Phone Number');
      table.string('gender', 2).comment('Gender');
      table.string('dob').comment('Date Of Birth');

      // Email Verification
      table.string('confirmation_token', 15).index().comment('Email Verification Token');
      table.timestamp('confirmed_at').comment('Confirmed At TimeStamps').defaultTo(knex.fn.now());
      table.timestamp('confirmation_sent_at').comment('Confirmation Sent At TimeStamps').defaultTo(knex.fn.now());

      // Reset Password
      table.string('reset_password_token').comment('Reset Password Token; is valid till reset_password_sentAt + admin.reset_time');
      table.timestamp('reset_password_sent_at').comment('Reset Password Sent At TimeStamps');

      table.string('shopify_customer_id').comment('Shopify Customer Id');

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    }).then(() => {
      const password_salt = Bcrypt.genSaltSync(10);
      const encrypted_password = Bcrypt.hashSync('admin123456', password_salt);

      return knex('users').insert({
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@selasfora.com',
        encrypted_password,
        password_salt
      });
    }),

    // Store social Logins
    knex.schema.createTableIfNotExists('social_logins', (table) => {
      table.increments('id').primary();
      table.integer('user_id').notNullable().references('users.id').comment('User table id');
      table.string('provider_id').notNullable().comment('User table id');
      table.string('provider').notNullable().comment('Source type: facebook, google etc');
      table.string('refresh_token').notNullable().comment('Source type: facebook, google etc');
      table.string('access_token').notNullable().comment('Source type: facebook, google etc');
      // TimeStamps
      table.boolean('is_primary_login').defaultTo(false).comment('Is Signed via?');

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    }).then(() => {
      console.log('Created Table: social_logins table');
    }),

    knex.schema.createTableIfNotExists('color_filter_options', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable().comment('Color Name');
      table.string('code').notNullable().comment('Color Code');

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    }).then(() => {
      console.log('Created Table: color_filter_options table');
    }),

    knex.schema.createTableIfNotExists('contact_us_query_options', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable().comment('Option Name');

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    }).then(() => {
      console.log('Created Table: contact_us_query_options table');
    }),

    knex.schema.createTableIfNotExists('material_filter_options', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable().comment('Option Name');

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    }).then(() => {
      console.log('Created Table: material_filter_options table');
    }),

    knex.schema.createTableIfNotExists('mood_filter_options', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable().comment('Option Name');

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    }).then(() => {
      console.log('Created Table: mood_filter_options table');
    }),

    knex.schema.createTableIfNotExists('newsletter', (table) => {
      table.increments('id').primary();
      table.string('email').notNullable().comment('Email');
      table.boolean('is_active').notNullable().comment('Is Active').defaultTo(true);

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    }).then(() => {
      console.log('Created Table: newsletter table');
    }),

    knex.schema.createTableIfNotExists('price_filter_options', (table) => {
      table.increments('id').primary();
      table.string('range').notNullable().comment('Price Range');

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    }).then(() => {
      console.log('Created Table: price_filter_options table');
    }),

    knex.schema.createTableIfNotExists('sort_by_options', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable().comment('Sort Option Name');

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    }).then(() => {
      console.log('Created Table: sort_by_options table');
    }),

    knex.schema.createTableIfNotExists('sorting_options', (table) => {
      table.increments('id').primary();
      table.string('range').notNullable().comment('Price Range');

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    }).then(() => {
      console.log('Created Table: sorting_options table');
    }),

    knex.schema.createTableIfNotExists('contact_us', (table) => {
      table.increments('id').primary();
      table.string('from').comment('From Email');
      table.string('name').comment('From Name');
      table.string('subject').comment('Subject');
      table.string('issue').comment('Issue');
      table.string('message').comment('Message');

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    }).then(() => {
      console.log('Created Table: contact_us table');
    })

  ]);
};

exports.down = function down(knex, Promise) {
  return Promise.all([
    knex.raw('drop table if exists color_filter_options cascade'),
    knex.raw('drop table if exists contact_us_query_options cascade'),
    knex.raw('drop table if exists material_filter_options cascade'),
    knex.raw('drop table if exists mood_filter_options cascade'),
    knex.raw('drop table if exists newsletter cascade'),
    knex.raw('drop table if exists price_filter_options cascade'),
    knex.raw('drop table if exists sort_by_options cascade'),
    knex.raw('drop table if exists sorting_options cascade'),
    knex.raw('drop table if exists contact_us cascade'),
    knex.raw('drop table if exists social_logins cascade'),
    knex.raw('drop table if exists users cascade'),
    knex.raw('truncate table knex_migrations_lock'),
    knex.raw('truncate table knex_migrations')
  ]).then((values) => {
    console.log('dropped all tables : ', values);
  }, (reason) => {
    console.log('failed to rollback db : ', reason);
  });
};
