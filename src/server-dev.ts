import { start } from './lib/server-impl';
import { createConfig } from './lib/create-config';
import { LogLevel } from './lib/logger';
import { ApiTokenType } from './lib/types/models/api-token';

process.nextTick(async () => {
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
                    enableHeapSnapshotEnpoint: true,
                },
                logLevel: LogLevel.debug,
                enableOAS: true,
                // secureHeaders: true,
                versionCheck: {
                    enable: false,
                },
                experimental: {
                    // externalResolver: unleash,
                    flags: {
                        embedProxy: true,
                        embedProxyFrontend: true,
                        anonymiseEventLog: false,
                        responseTimeWithAppNameKillSwitch: false,
                        newProjectOverview: true,
                        bulkOperations: true,
                        projectStatusApi: true,
                        projectScopedSegments: true,
                        projectScopedStickiness: true,
                        optimal304: true,
                        optimal304Differ: false,
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
                /* can be tweaked to control configuration caching for /api/client/features
                clientFeatureCaching: {
                    enabled: true,
                    maxAge: 4000,
                },
                */
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
