import { start } from './lib/server-impl.js';
import { createConfig } from './lib/create-config.js';
import { LogLevel } from './lib/logger.js';
import { ApiTokenType } from './lib/types/model.js';

process.nextTick(async () => {
    try {
        await start(
            createConfig({
                db: process.env.DATABASE_URL
                    ? undefined
                    : {
                          user: 'unleash_user',
                          password: 'password',
                          host: 'localhost',
                          port: 5432,
                          database:
                              process.env.UNLEASH_DATABASE_NAME || 'unleash',
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
                secureHeaders: false,
                versionCheck: {
                    enable: false,
                },
                experimental: {
                    // externalResolver: unleash,
                    flags: {
                        anonymiseEventLog: false,
                        responseTimeWithAppNameKillSwitch: false,
                        outdatedSdksBanner: true,
                        disableShowContextFieldSelectionValues: false,
                        feedbackPosting: true,
                        manyStrategiesPagination: true,
                        enableLegacyVariants: false,
                        extendedMetrics: true,
                        webhookDomainLogging: true,
                        showUserDeviceCount: true,
                        deltaApi: true,
                        uniqueSdkTracking: true,
                        strictSchemaValidation: true,
                        customMetrics: true,
                        impactMetrics: true,
                        lifecycleGraphs: true,
                        globalChangeRequestList: true,
                        trafficBillingDisplay: true,
                        milestoneProgression: true,
                        featureReleasePlans: true,
                        safeguards: true,
                    },
                },
                authentication: {
                    initApiTokens: [
                        {
                            environment: '*',
                            projects: ['*'],
                            secret: '*:*.964a287e1b728cb5f4f3e0120df92cb5',
                            type: ApiTokenType.ADMIN,
                            tokenName: 'some-user',
                        },
                    ],
                },
                prometheusImpactMetricsApi: 'http://localhost:9090',
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
