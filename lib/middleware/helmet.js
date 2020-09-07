const helmet = require('helmet');

module.exports = function(config) {
    if (config.enableHelmet) {
        return helmet({
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
                        'fonts.googleapis.com',
                        'fonts.gstatic.com',
                        'data:',
                        'unsafe-inline',
                    ],
                },
            },
        });
    }
    return (req, res, next) => {
        next();
    };
};
