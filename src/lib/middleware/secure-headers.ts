import helmet from 'helmet';
import { RequestHandler } from 'express';
import { IUnleashConfig } from '../types';
import { hoursToSeconds } from 'date-fns';

const secureHeaders: (config: IUnleashConfig) => RequestHandler = (config) => {
    if (config.secureHeaders) {
        return helmet({
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
        });
    }
    return (req, res, next) => {
        next();
    };
};

export default secureHeaders;
