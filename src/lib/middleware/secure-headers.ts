import helmet from 'helmet';
import type { RequestHandler } from 'express';
import type { IUnleashConfig } from '../types/index.js';
import { hoursToSeconds } from 'date-fns';

const LOGROCKET_SCRIPT_SRC = [
    'https://cdn.logrocket.io',
    'https://cdn.lr-ingest.io',
    'https://cdn.lr-in.com',
    'https://cdn.lr-in-prod.com',
    'https://cdn.lr-ingest.com',
    'https://cdn.ingest-lr.com',
    'https://cdn.lr-intake.com',
    'https://cdn.intake-lr.com',
    'https://cdn.logr-ingest.com',
    'https://cdn.lrkt-in.com',
    'https://cdn.lgrckt-in.com',
    'https://cdn.logr-in.com',
];

const LOGROCKET_CONNECT_SRC = [
    'https://*.logrocket.io',
    'https://*.logrocket.com',
    'https://*.lr-ingest.io',
    'https://*.lr-in.com',
    'https://*.lr-in-prod.com',
    'https://*.lr-ingest.com',
    'https://*.ingest-lr.com',
    'https://*.lr-intake.com',
    'https://*.intake-lr.com',
    'https://*.logr-ingest.com',
    'https://*.lrkt-in.com',
    'https://*.lgrckt-in.com',
    'https://*.logr-in.com',
];

const HUBSPOT_SCRIPT_SRC = [
    'https://js.hs-scripts.com',
    'https://js.hs-analytics.net',
    'https://js.hs-banner.com',
    'https://js.hsforms.net',
    'https://js.usemessages.com',
    'https://js.hscollectedforms.net',
    'https://static.hsappstatic.net',
];

const HUBSPOT_CONNECT_SRC = [
    'https://*.hubspot.com',
    'https://api.hubapi.com',
    'https://forms.hsforms.com',
    'https://forms.hscollectedforms.net',
    'https://static.hsappstatic.net',
    'wss://*.hubspot.com',
];

const HUBSPOT_FRAME_SRC = ['https://app.hubspot.com', 'https://*.hubspot.com'];

const HUBSPOT_IMG_SRC = [
    'https://track.hubspot.com',
    'https://*.hubspot.com',
    'https://*.hs-analytics.net',
    'https://*.hsforms.com',
];

const flightRecorderConnectSrc = (flightRecorderUrl?: string): string[] => {
    if (!flightRecorderUrl) {
        return [];
    }
    try {
        return [new URL(flightRecorderUrl).origin];
    } catch {
        return [];
    }
};

const secureHeaders: (config: IUnleashConfig) => RequestHandler = (config) => {
    if (config.secureHeaders) {
        const includeUnsafeInline = !config.flagResolver.isEnabled(
            'removeUnsafeInlineStyleSrc',
        );
        const logRocketEnabled = Boolean(config.server.logRocketAppId);
        const logRocketScriptSrc = logRocketEnabled ? LOGROCKET_SCRIPT_SRC : [];
        const logRocketConnectSrc = logRocketEnabled
            ? LOGROCKET_CONNECT_SRC
            : [];
        const hubspotChatEnabled =
            Boolean(config.server.hubspotPortalId) &&
            config.ui?.billing === 'pay-as-you-go' &&
            config.flagResolver.isEnabled('hubspotChatEnabled');
        const hubspotScriptSrc = hubspotChatEnabled ? HUBSPOT_SCRIPT_SRC : [];
        const hubspotConnectSrc = hubspotChatEnabled ? HUBSPOT_CONNECT_SRC : [];
        const hubspotFrameSrc = hubspotChatEnabled ? HUBSPOT_FRAME_SRC : [];
        const hubspotImgSrc = hubspotChatEnabled ? HUBSPOT_IMG_SRC : [];
        const flightRecorderVariant = config.flagResolver.getVariant(
            'flightRecorderFrontend',
        );
        const flightRecorderUrl = flightRecorderVariant.enabled
            ? flightRecorderVariant.payload?.value
            : undefined;
        const flightRecorderSrc = flightRecorderConnectSrc(flightRecorderUrl);
        const workerSrc = logRocketEnabled ? ["'self'", 'blob:'] : ["'self'"];
        const styleSrc = ["'self'"];
        if (includeUnsafeInline) {
            styleSrc.push("'unsafe-inline'");
        }
        styleSrc.push(
            'cdn.getunleash.io',
            'fonts.googleapis.com',
            'fonts.gstatic.com',
            'data:',
            ...config.additionalCspAllowedDomains.styleSrc,
        );
        const defaultHelmet = helmet({
            hsts: {
                maxAge: hoursToSeconds(24 * 365 * 2), // 2 non-leap years
                includeSubDomains: true,
                preload: true,
            },
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: [
                        "'self'",
                        'cdn.getunleash.io',
                        'gravatar.com',
                        ...config.additionalCspAllowedDomains.defaultSrc,
                    ],
                    fontSrc: [
                        "'self'",
                        'cdn.getunleash.io',
                        'fonts.googleapis.com',
                        'fonts.gstatic.com',
                        ...config.additionalCspAllowedDomains.fontSrc,
                    ],
                    styleSrc,
                    scriptSrc: [
                        "'self'",
                        'cdn.getunleash.io',
                        ...logRocketScriptSrc,
                        ...hubspotScriptSrc,
                        ...config.additionalCspAllowedDomains.scriptSrc,
                    ],
                    imgSrc: [
                        "'self'",
                        'data:',
                        'cdn.getunleash.io',
                        'gravatar.com',
                        ...hubspotImgSrc,
                        ...config.additionalCspAllowedDomains.imgSrc,
                    ],
                    connectSrc: [
                        "'self'",
                        'cdn.getunleash.io',
                        'docs.getunleash.io',
                        'p6vyurbgg0-dsn.algolia.net',
                        'p6vyurbgg0-1.algolianet.com',
                        'p6vyurbgg0-2.algolianet.com',
                        'p6vyurbgg0-3.algolianet.com',
                        'fai.buildwithfern.com',
                        'plausible.getunleash.io',
                        'gravatar.com',
                        'europe-west3-metrics-304612.cloudfunctions.net',
                        'app.unleash-hosted.com',
                        'hosted.edge.getunleash.io',
                        ...flightRecorderSrc,
                        ...logRocketConnectSrc,
                        ...hubspotConnectSrc,
                        ...config.additionalCspAllowedDomains.connectSrc,
                    ],
                    workerSrc,
                    childSrc: workerSrc,
                    mediaSrc: [
                        "'self'",
                        'cdn.getunleash.io',
                        '*.youtube.com',
                        '*.youtube-nocookie.com',
                        ...config.additionalCspAllowedDomains.mediaSrc,
                    ],
                    objectSrc: [
                        '*.youtube.com',
                        '*.youtube-nocookie.com',
                        ...config.additionalCspAllowedDomains.objectSrc,
                    ],
                    frameSrc: [
                        "'self'",
                        'cdn.getunleash.io',
                        'gravatar.com',
                        '*.youtube.com',
                        '*.youtube-nocookie.com',
                        ...hubspotFrameSrc,
                        ...config.additionalCspAllowedDomains.frameSrc,
                    ],
                },
            },
            crossOriginEmbedderPolicy: hubspotChatEnabled
                ? false
                : { policy: 'credentialless' },
            originAgentCluster: false,
            xDnsPrefetchControl: false,
        });
        const apiHelmet = helmet({
            hsts: {
                maxAge: hoursToSeconds(24 * 365 * 2), // 2 non-leap years
                includeSubDomains: true,
                preload: true,
            },
            contentSecurityPolicy: {
                directives: {
                    defaultSrc:
                        helmet.contentSecurityPolicy
                            .dangerouslyDisableDefaultSrc,
                    fontSrc: null,
                    styleSrc: null,
                    scriptSrc: null,
                    imgSrc: null,
                    connectSrc: null,
                    mediaSrc: null,
                    objectSrc: null,
                    frameSrc: null,
                    upgradeInsecureRequests: null,
                    scriptSrcAttr: null,
                    baseUri: null,
                    formAction: null,
                    frameAncestors: ["'none'"],
                },
            },

            crossOriginEmbedderPolicy: false,
            crossOriginResourcePolicy: false,
            crossOriginOpenerPolicy: false,
            originAgentCluster: false,
            xXssProtection: false,
            xDnsPrefetchControl: false,
            xFrameOptions: { action: 'deny' },
        });

        return (req, res, next) => {
            if (req.method === 'OPTIONS') {
                return next();
            } else if (
                req.path.startsWith(`${config.server.baseUriPath}/api/`)
            ) {
                apiHelmet(req, res, next);
            } else {
                defaultHelmet(req, res, next);
            }
        };
    }
    return (_req, _res, next) => {
        next();
    };
};

export default secureHeaders;
