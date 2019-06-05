'use strict';

module.exports = {
    development: {
        client: 'sqlite3',
        connection: {
            filename: './dev.sqlite3',
            schema: 'unleash',
        },
        migrations: {
            tableName: 'knex_migrations',
        },
        // This causes a warning, but doesn't break everything.
        // sqlite3 can't do default fields, so we have to fill it in.
        // frontend is not hardened against null values that it expects.
        useNullAsDefault: false,
    },

    staging: {
        client: 'postgresql',
        connection: {
            database: 'unleash',
            user: 'username',
            password: 'password',
            schema: 'unleash',
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: 'knex_migrations',
        },
        useNullAsDefault: true,
    },

    production: {
        client: 'postgresql',
        connection: {
            database: process.env.DATABASE_NAME || 'unleash',
            user: process.env.DATABASE_USER || 'postgres',
            password: process.env.DATABASE_PASSWORD || 'postgres',
            host: process.env.DATABASE_HOST || 'localhost',
            port: process.env.DATABASE_PORT || 5432,
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: 'knex_migrations',
        },
        useNullAsDefault: true,
    },
};
