import Mustache from 'mustache';
import Addon from './addon';
import definition from './webhook-definition';
import { LogProvider } from '../logger';
import { IEvent } from '../types/events';
// import { head } from 'superagent';

interface IParameters {
    url: string;
    bodyTemplate?: string;
    contentType?: string;
    authorization?: string;
}

export default class Webhook extends Addon {
    constructor(args: { getLogger: LogProvider }) {
        super(definition, args);
    }

    async handleEvent(event: IEvent, parameters: IParameters): Promise<void> {
        const { url, bodyTemplate, contentType, authorization } = parameters;
        const context = {
            event,
        };

        let body;

        if (typeof bodyTemplate === 'string' && bodyTemplate.length > 1) {
            body = Mustache.render(bodyTemplate, context);
        } else {
            body = JSON.stringify(event);
        }

        let headers;

        if (authorization) {
            headers = {
                'Content-Type': contentType || 'application/json',
                Authorization: authorization,
            };
        } else {
            headers = { 'Content-Type': contentType || 'application/json' };
        }

        const requestOpts = {
            method: 'POST',
            headers: headers,
            body,
        };
        const res = await this.fetchRetry(url, requestOpts);

        this.logger.info(
            `Handled event "${event.type}". Status code: ${res.status}`,
        );
    }
}
