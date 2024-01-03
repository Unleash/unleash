import helmet from 'helmet';
import { RequestHandler } from 'express';
import { IUnleashConfig } from '../types';
import { hoursToSeconds } from 'date-fns';

const secureHeaders: (config: IUnleashConfig) => RequestHandler = (config) => {
    if (config.secureHeaders) {
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
                    styleSrc: [
                        "'self'",
                        "'unsafe-inline'",
                        'cdn.getunleash.io',
                        'fonts.googleapis.com',
                        'fonts.gstatic.com',
                        'data:',
                        ...config.additionalCspAllowedDomains.styleSrc,
                    ],
                    scriptSrc: [
                        "'self'",
                        'cdn.getunleash.io',
                        ...config.additionalCspAllowedDomains.scriptSrc,
                    ],
                    imgSrc: [
                        "'self'",
                        'data:',
                        'cdn.getunleash.io',
                        'gravatar.com',
                        ...config.additionalCspAllowedDomains.imgSrc,
                    ],
                    connectSrc: [
                        "'self'",
                        'cdn.getunleash.io',
                        'plausible.getunleash.io',
                        'gravatar.com',
                        'europe-west3-metrics-304612.cloudfunctions.net',
                        'app.unleash-hosted.com',
                        ...config.additionalCspAllowedDomains.connectSrc,
                    ],
                    mediaSrc: [
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
                        ...config.additionalCspAllowedDomains.frameSrc,
                    ],
                },
            },
            crossOriginEmbedderPolicy: false,
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
                req.path.startsWith(`${config.server.baseUriPath}/api/`) &&
                config.flagResolver.isEnabled('stripHeadersOnAPI')
            ) {
                apiHelmet(req, res, next);
            } else {
                defaultHelmet(req, res, next);
            }
        };
    }
    return (req, res, next) => {
        next();
    };
};

export default secureHeaders;
