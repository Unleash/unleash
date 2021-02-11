'use strict';

const Mustache = require('mustache');
const Addon = require('./addon');
const definition = require('./webhook-definition');

class Webhook extends Addon {
    constructor(args) {
        super(definition, args);
    }

    async handleEvent(event, parameters) {
        const { url, bodyTemplate, contentType } = parameters;
        const context = {
            event,
        };

        let body;

        if (typeof bodyTemplate === 'string' && bodyTemplate.length > 1) {
            body = Mustache.render(bodyTemplate, context);
        } else {
            body = JSON.stringify(event);
        }

        const requestOpts = {
            method: 'POST',
            headers: { 'Content-Type': contentType || 'application/json' },
            body,
        };
        const res = await this.fetchRetry(url, requestOpts);

        this.logger.info(
            `Handled event "${event.type}". Status code: ${res.status}`,
        );
    }
}

module.exports = Webhook;
