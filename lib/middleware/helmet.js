const helmet = require('helmet');

module.exports = function(config) {
    if (config.enableHelmet) {
        return helmet({
            hsts: {
                maxAge: 63072000,
                includeSubDomains: true,
                preload: true,
            },
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: [
                        "'self'",
                        'fonts.googleapis.com',
                        'fonts.gstatic.com',
                        'data:',
                        'gravatar.com',
                    ],
                    styleSrc: [
                        "'self'",
                        "'unsafe-inline'",
                        'fonts.googleapis.com',
                        'fonts.gstatic.com',
                        'data:',
                    ],
                },
            },
        });
    }
    return (req, res, next) => {
        next();
    };
};
