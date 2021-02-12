'use strict';

const fetch = require('node-fetch');
const { addonDefinitionSchema } = require('./addon-schema');

class Addon {
    constructor(definition, { getLogger }) {
        this.logger = getLogger(`addon/${definition.name}`);
        const { error } = addonDefinitionSchema.validate(definition);
        if (error) {
            this.logger.warn(
                `Could not load addon provider ${definition.name}`,
                error,
            );
            throw error;
        }
        this._name = definition.name;
        this._definition = definition;
    }

    get name() {
        return this._name;
    }

    get definition() {
        return this._definition;
    }

    async fetchRetry(url, options = {}, retries = 1, backoff = 300) {
        const retryCodes = [408, 500, 502, 503, 504, 522, 524];
        const res = await fetch(url, options);
        if (res.ok) {
            return res;
        }
        if (retries > 0 && retryCodes.includes(res.status)) {
            setTimeout(() => {
                return this.fetchRetry(url, options, retries - 1, backoff * 2);
            }, backoff);
        }
        return res;
    }
}

module.exports = Addon;
