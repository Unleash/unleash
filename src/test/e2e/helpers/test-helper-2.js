process.env.NODE_ENV = 'test';
/* eslint-disable-next-line */
const supertest = require('supertest');

const { create } = require('../../../lib/server-impl');
const getLogger = require('../../fixtures/no-logger');
const dbConfig = require('./database-config');
const migrator = require('../../../migrator');

process.setMaxListeners(0);

async function prepareDatabase(db, databaseSchema) {
    await db.raw(`DROP SCHEMA IF EXISTS ${databaseSchema} CASCADE`);
    await db.raw(`CREATE SCHEMA IF NOT EXISTS ${databaseSchema}`);
    await migrator({ db: dbConfig.getDb(), databaseSchema });
}

module.exports = {
    async setupApp(databaseSchema, preHook) {
        const { app, config, stop, services } = await create({
            preHook,
            serverMetrics: false,
            databaseSchema,
            disableDBMigration: true,
            db: dbConfig.getDb(),
            session: {
                db: false,
                age: 4000,
            },
            getLogger,
        });
        config.stores.clientMetricsStore.setMaxListeners(0);
        config.stores.eventStore.setMaxListeners(0);
        await prepareDatabase(config.stores.db, databaseSchema);
        return {
            request: supertest.agent(app),
            stop,
            config,
            services,
        };
    },
};
