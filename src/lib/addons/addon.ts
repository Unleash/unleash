import fetch, { Response } from 'node-fetch';
import { addonDefinitionSchema } from './addon-schema';
import { IUnleashConfig } from '../types/option';
import { Logger } from '../logger';
import { IAddonDefinition, IEvent } from '../types/model';

export default abstract class Addon {
    logger: Logger;

    _name: string;

    _definition: IAddonDefinition;

    constructor(
        definition: IAddonDefinition,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
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

    get name(): string {
        return this._name;
    }

    get definition(): IAddonDefinition {
        return this._definition;
    }

    async fetchRetry(
        url: string,
        options = {},
        retries: number = 1,
        backoff: number = 300,
    ): Promise<Response> {
        const retryCodes = [408, 500, 502, 503, 504, 522, 524];
        let res;
        try {
            res = await fetch(url, options);
        } catch (error) {
            res = { status: 500, ok: false };
        }
        if (res.ok) {
            return res;
        }
        if (retries > 0 && retryCodes.includes(res.status)) {
            setTimeout(
                () => this.fetchRetry(url, options, retries - 1, backoff * 2),
                backoff,
            );
        }
        return res;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    abstract handleEvent(event: IEvent, parameters: any): Promise<void>;
}
