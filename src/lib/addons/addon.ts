import ky, { type Options } from 'ky';
import { addonDefinitionSchema } from './addon-schema.js';
import type { Logger } from '../logger.js';
import type { IAddonConfig, IAddonDefinition } from '../types/model.js';
import type { IEvent } from '../events/index.js';
import type { IntegrationEventsService } from '../features/integration-events/integration-events-service.js';
import type { IntegrationEventWriteModel } from '../features/integration-events/integration-events-store.js';
import type EventEmitter from 'events';
import type { IFlagResolver } from '../types/index.js';
import { ADDON_EVENTS_HANDLED } from '../metric-events.js';
import {
    type ValidatedUrl,
    validateUrl,
    type ValidateUrlOptions,
} from './validate-url.js';
import { Agent, fetch as undiciFetch } from 'undici';

export type FetchRetryOptions = Omit<
    Options,
    'fetch' | 'redirect' | 'retry'
> & {
    validateUrlOptions?: ValidateUrlOptions;
};

export default abstract class Addon {
    logger: Logger;

    _name: string;

    _definition: IAddonDefinition;

    integrationEventsService: IntegrationEventsService;

    eventBus: EventEmitter;

    flagResolver: IFlagResolver;

    constructor(
        definition: IAddonDefinition,
        {
            getLogger,
            integrationEventsService,
            flagResolver,
            eventBus,
        }: IAddonConfig,
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
        this.integrationEventsService = integrationEventsService;
        this.eventBus = eventBus;
        this.flagResolver = flagResolver;
    }

    get name(): string {
        return this._name;
    }

    get definition(): IAddonDefinition {
        return this._definition;
    }

    async fetchRetry(
        url: string,
        options: FetchRetryOptions = {},
        retries: number = 1,
    ): Promise<Response> {
        try {
            const validated = await validateUrl(
                url,
                options.validateUrlOptions,
            );
            return await fetchPinned(validated, {
                ...options,
                retry: retries,
            });
        } catch (e) {
            const { method } = options;
            const status = getErrorStatus(e);
            this.logger.warn(
                `Error querying with method ${
                    method || 'GET'
                } status code ${status}`,
                { error: e, cause: (e as Error & { cause?: unknown }).cause },
            );
            return { status, ok: false } as Response;
        }
    }

    abstract handleEvent(
        event: IEvent,
        parameters: any,
        integrationId: number,
    ): Promise<void>;

    async registerEvent(
        integrationEvent: IntegrationEventWriteModel,
    ): Promise<void> {
        await this.integrationEventsService.registerEvent(integrationEvent);
        this.eventBus.emit(ADDON_EVENTS_HANDLED, {
            result: integrationEvent.state,
            destination: this.name,
        });
    }

    destroy?(): void;
}

export const fetchPinned = async (
    validated: ValidatedUrl,
    options: Omit<Options, 'fetch' | 'redirect' | 'throwHttpErrors'>,
): Promise<Response> => {
    const dispatcher = new Agent({
        connect: {
            autoSelectFamily: false,
            lookup: (_hostname, opts, callback) => {
                const address = validated.pinnedAddress;
                const family = Number(validated.family) as 4 | 6;
                callback(null, address, family);
            },
            servername:
                validated.url.protocol === 'https:'
                    ? validated.hostname
                    : undefined,
        },
    });

    try {
        return await ky(validated.url.href, {
            ...options,
            // Do not let 30x redirect to metadata/internal hoststs
            redirect: 'manual',
            // Important: return 30x responses instead of throwing
            throwHttpErrors: false,
            // Force ky to use undici with our pinned DNS result.
            fetch: (_input, init) =>
                undiciFetch(validated.url.href, {
                    method: init?.method,
                    headers: init?.headers,
                    body: init?.body,
                    signal: init?.signal,
                    dispatcher,
                } as Parameters<typeof undiciFetch>[1]) as Promise<Response>,
        });
    } finally {
        await dispatcher.destroy();
    }
};

const getErrorStatus = (error: unknown): number => {
    if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'status' in error.response &&
        typeof error.response.status === 'number'
    ) {
        return error.response.status;
    }

    if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        typeof error.code === 'number'
    ) {
        return error.code;
    }
    return 500;
};
