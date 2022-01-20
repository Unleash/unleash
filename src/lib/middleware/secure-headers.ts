import helmet from 'helmet';
import { RequestHandler } from 'express';
import { IUnleashConfig } from '../types/option';
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
                    defaultSrc: ["'self'", 'cdn.getunleash.io', 'gravatar.com'],
                    fontSrc: [
                        "'self'",
                        'cdn.getunleash.io',
                        'fonts.googleapis.com',
                        'fonts.gstatic.com',
                    ],
                    styleSrc: [
                        "'self'",
                        "'unsafe-inline'",
                        'cdn.getunleash.io',
                        'fonts.googleapis.com',
                        'fonts.gstatic.com',
                        'data:',
                    ],
                    scriptSrc: ["'self'", 'cdn.getunleash.io'],
                    imgSrc: [
                        "'self'",
                        'data:',
                        'cdn.getunleash.io',
                        'gravatar.com',
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
