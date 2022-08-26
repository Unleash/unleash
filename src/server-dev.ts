import { start } from './lib/server-impl';
import { createConfig } from './lib/create-config';
import { LogLevel } from './lib/logger';
import { ApiTokenType } from './lib/types/models/api-token';
import { startUnleash } from 'unleash-client';

process.nextTick(async () => {
    const unleash = await startUnleash({
        appName: 'my-app-name',
        url: 'http://unleash4.herokuapp.com/api/',
        customHeaders: {
            Authorization:
                '*:development.621eccf01310389e1c2ea2409dfc5bdc4fd29543fb6355c0883e7af5',
        },
    });

    try {
        await start(
            createConfig({
                db: {
                    user: 'unleash_user',
                    password: 'passord',
                    host: 'localhost',
                    port: 5432,
                    database: process.env.UNLEASH_DATABASE_NAME || 'unleash',
                    schema: process.env.UNLEASH_DATABASE_SCHEMA,
                    ssl: false,
                    applicationName: 'unleash',
                },
                server: {
                    enableRequestLogger: true,
                    baseUriPath: '',
                    // keepAliveTimeout: 1,
                    gracefulShutdownEnable: true,
                    // cdnPrefix: 'https://cdn.getunleash.io/unleash/v4.4.1',
                },
                logLevel: LogLevel.debug,
                enableOAS: true,
                // secureHeaders: true,
                versionCheck: {
                    enable: false,
                },
                experimental: {
                    externalResolver: unleash,
                    flags: {
                        batchMetrics: true,
                        anonymiseEventLog: false,
                    },
                },
                authentication: {
                    initApiTokens: [
                        {
                            environment: '*',
                            project: '*',
                            secret: '*:*.964a287e1b728cb5f4f3e0120df92cb5',
                            type: ApiTokenType.ADMIN,
                            username: 'some-user',
                        },
                    ],
                },
            }),
        );
    } catch (error) {
        if (error.code === 'EADDRINUSE') {
            // eslint-disable-next-line no-console
            console.warn('Port in use. You might want to reload once more.');
        } else {
            // eslint-disable-next-line no-console
            console.error(error);
            process.exit();
        }
    }
}, 0);
