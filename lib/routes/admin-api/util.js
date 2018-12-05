'use strict';

const logger = require('../../logger')('/admin-api/util.js');

const isUrlFriendlyName = input => encodeURIComponent(input) === input;

const handleErrors = (res, error) => {
    logger.warn(error.message);
    switch (error.name) {
        case 'NotFoundError':
            return res.status(404).end();
        case 'NameInvalidError':
            return res
                .status(400)
                .json([{ msg: error.message }])
                .end();
        case 'NameExistsError':
            return res
                .status(403)
                .json([{ msg: error.message }])
                .end();
        case 'ValidationError':
            return res
                .status(400)
                .json(error)
                .end();
        default:
            logger.error('Server failed executing request', error);
            return res.status(500).end();
    }
};

module.exports = { isUrlFriendlyName, handleErrors };
