'use strict';

class FeatureHasTagError extends Error {
    constructor(message) {
        super();
        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;
        this.message = message;
    }

    toJSON() {
        const obj = {
            isJoi: false,
            name: this.constructor.name,
            details: [
                {
                    message: this.message,
                },
            ],
        };
        return obj;
    }
}

module.exports = FeatureHasTagError;
