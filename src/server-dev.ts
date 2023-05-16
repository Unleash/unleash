import { start } from './lib/server-impl';
import { createConfig } from './lib/create-config';
import { LogLevel } from './lib/logger';
import { ApiTokenType } from './lib/types/models/api-token';
import { PayloadType } from 'lib/types';

process.nextTick(async () => {
    try {
        await start(
            createConfig({
                db: {
                    user: 'unleash_user',
                    password: 'password',
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
                        variantMetrics: true,
                        strategyImprovements: true,
                        messageBanner: {
                            name: 'message-banner',
                            enabled: true,
                            payload: {
                                type: 'json' as PayloadType,
                                value: `{
                                    "message": "**New message banner!** Check out this new feature.",
                                    "variant": "secondary",
                                    "sticky": true,
                                    "link": "dialog",
                                    "linkText": "What is this?",
                                    "plausibleEvent": "message_banner",
                                    "dialog": "![Message Banner](https://www.getunleash.io/logos/unleash_pos.svg)\\n## Message Banner 🎉\\n**New message banner!**\\n\\nCheck out this new feature:\\n\\n- Get the latest announcements\\n- Get warnings about your Unleash instance\\n\\nYou can read more about it on our newest [blog post](https://www.getunleash.io/blog).",
                                    "icon": "none"
                                }`,
                            },
                        },
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
