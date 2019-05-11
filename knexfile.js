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
        useNullAsDefault: true,
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
