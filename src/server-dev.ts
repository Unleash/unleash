import { start } from './lib/server-impl';
import { createConfig } from './lib/create-config';
import { LogLevel } from './lib/logger';
import { ApiTokenType } from './lib/types/models/api-token';
import { parseEnvVarNumber, parseEnvVarBoolean } from './lib/util';

process.nextTick(async () => {
    try {
        await start(
            createConfig({
                db: process.env.DATABASE_URL
                    ? undefined
                    : {
                          user: process.env.DATABASE_USERNAME || 'unleash_user',
                          password: process.env.DATABASE_PASSWORD || 'password',
                          host: process.env.DATABASE_HOST || 'localhost',
                          port: parseEnvVarNumber(
                              process.env.DATABASE_PORT,
                              5432,
                          ),
                          database: process.env.DATBASE_NAME || 'unleash',
                          schema: process.env.DATABASE_SCHEMA,
                          ssl: false,
                          applicationName:
                              process.env.DATABASE_APPLICATION_NAME ||
                              'unleash',
                          disableMigration: parseEnvVarBoolean(
                              process.env.DATABASE_DISABLE_MIGRATION,
                              false,
                          ),
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
                secureHeaders: false,
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
                        celebrateUnleash: true,
                        userAccessUIEnabled: true,
                        outdatedSdksBanner: true,
                        disableShowContextFieldSelectionValues: false,
                        feedbackPosting: true,
                        manyStrategiesPagination: true,
                        enableLegacyVariants: false,
                        extendedMetrics: true,
                        purchaseAdditionalEnvironments: true,
                        originMiddlewareRequestLogging: true,
                        unleashAI: true,
                        webhookDomainLogging: true,
                        releasePlans: false,
                        simplifyProjectOverview: true,
                        showUserDeviceCount: true,
                        flagOverviewRedesign: false,
                        licensedUsers: true,
                    },
                },
                authentication: {
                    initApiTokens: [
                        {
                            environment: '*',
                            project: '*',
                            secret: '*:*.964a287e1b728cb5f4f3e0120df92cb5',
                            type: ApiTokenType.ADMIN,
                            tokenName: 'some-user',
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
