import Mustache from 'mustache';
import Addon from './addon';
import definition from './webhook-definition';
import { LogProvider } from '../logger';
import { IEvent } from '../types/model';

export default class Webhook extends Addon {
    constructor(args: { getLogger: LogProvider }) {
        super(definition, args);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async handleEvent(event: IEvent, parameters: any): Promise<void> {
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
