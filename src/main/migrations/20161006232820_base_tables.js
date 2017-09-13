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
      table.string('fullName', 255).comment('Full Name');
      table.string('userName', 255).index().notNullable().unique()
        .comment('Unique User name');

      // Password and Salt
      table.string('encryptedPassword').notNullable().comment('Encrypted password');
      table.string('passwordSalt').notNullable().comment('Password Salt');

      table.string('phoneNumber', 15).comment('Phone Number');
      table.string('type', 15).index().comment('Type - chef or restaurant');

      // Email Verification
      table.string('emailToken', 15).index().comment('Email Verification Token');
      table.boolean('isEmailVerified').defaultTo(false).comment('Check if email is verified');

      // Reset Password
      table.string('resetPasswordToken').comment('Reset Password Token; is valid till reset_password_sentAt + admin.reset_time');
      table.timestamp('resetPasswordSentAt').comment('Reset Password Sent At TimeStamps');

      table.boolean('isBlocked').defaultTo(false).comment('Check if User is blocked');

      table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now());
    }).then(() => {
      const passwordSalt = Bcrypt.genSaltSync(10);
      const encryptedPassword = Bcrypt.hashSync('admin123456', passwordSalt);

      return knex('users').insert({
        fullName: 'Admin User',
        userName: 'admin',
        email: 'admin@selasfora.com',
        encryptedPassword,
        passwordSalt,
        type: 'chef'
      });
    }),

    // Store social Logins
    knex.schema.createTableIfNotExists('social_logins', (table) => {
      table.increments('id').primary();
      table.integer('userId').notNullable().references('users.id').comment('User table id');
      table.string('providerId').notNullable().comment('User table id');
      table.string('provider').notNullable().comment('Source type: facebook, google etc');
      table.string('refreshToken').notNullable().comment('Source type: facebook, google etc');
      table.string('accessToken').notNullable().comment('Source type: facebook, google etc');
      // TimeStamps
      table.boolean('isPrimaryLogin').defaultTo(false).comment('Is Signed via?');

      table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now());
    }).then(() => {
      console.log('Created Table: social_logins table');
      // return knex.schema.raw('CREATE UNIQUE INDEX social_logins_cred_idx ON social_logins
      // ("providerId", "provider") WHERE "isActive" = true');
    })

  ]);
};

exports.down = function down(knex, Promise) {
  return Promise.all([
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
