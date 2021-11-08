import Mustache from 'mustache';
import Addon from './addon';
import definition from './webhook-definition';
import { LogProvider } from '../logger';
import { IEvent } from '../types/events';

interface IParameters {
    url: string;
    bodyTemplate?: string;
    contentType?: string;
}

export default class Webhook extends Addon {
    constructor(args: { getLogger: LogProvider }) {
        super(definition, args);
    }

    async handleEvent(event: IEvent, parameters: IParameters): Promise<void> {
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
