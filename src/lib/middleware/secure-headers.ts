import helmet from 'helmet';
import { RequestHandler } from 'express';
import { IUnleashConfig } from '../types/option';

const secureHeaders: (config: IUnleashConfig) => RequestHandler = (config) => {
    if (config.secureHeaders) {
        return helmet({
            hsts: {
                maxAge: 63072000,
                includeSubDomains: true,
                preload: true,
            },
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    fontSrc: [
                        "'self'",
                        'fonts.googleapis.com',
                        'fonts.gstatic.com',
                    ],
                    styleSrc: [
                        "'self'",
                        "'unsafe-inline'",
                        'fonts.googleapis.com',
                        'fonts.gstatic.com',
                        'data:',
                    ],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", 'data:', 'gravatar.com'],
                },
            },
        });
    }
    return (req, res, next) => {
        next();
    };
};

export default secureHeaders;
