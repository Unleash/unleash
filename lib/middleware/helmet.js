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
                },
            },
        });
    }
    return (req, res, next) => {
        next();
    };
};
