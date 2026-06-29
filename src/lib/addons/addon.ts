import ky, { type Options } from 'ky';
import http from 'node:http';
import https from 'node:https';
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

    allowPrivateUrls: boolean;

    allowList: string[];

    constructor(
        definition: IAddonDefinition,
        {
            getLogger,
            integrationEventsService,
            flagResolver,
            eventBus,
            allowPrivateUrls,
            allowList,
        }: IAddonConfig,
    ) {
        this.logger = getLogger(`addon/${definition.name}`);
        this.allowPrivateUrls = allowPrivateUrls ?? false;
        this.allowList = allowList ?? [];
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
            const validated = await validateUrl(url, {
                allowPrivateNetworkUrls: this.allowPrivateUrls,
                allowList: {
                    hosts: this.allowList,
                    suffixes: [],
                },
                ...options.validateUrlOptions,
            });
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
    return ky(validated.url.href, {
        ...options,
        // Do not let 30x redirect to metadata/internal hosts.
        redirect: 'manual',
        // Important: return 30x responses instead of throwing.
        throwHttpErrors: false,
        fetch: (input, init) => fetchWithPinnedLookup(input, init, validated),
    });
};

const fetchWithPinnedLookup = async (
    input: Parameters<typeof fetch>[0],
    init: Parameters<typeof fetch>[1],
    validated: ValidatedUrl,
): Promise<Response> => {
    const request = new Request(input, init);
    const body = request.body
        ? Buffer.from(await request.arrayBuffer())
        : undefined;
    const requestUrl = new URL(request.url);
    const client = requestUrl.protocol === 'https:' ? https : http;

    return new Promise<Response>((resolve, reject) => {
        const req = client.request(
            requestUrl,
            {
                method: request.method,
                headers: Object.fromEntries(request.headers),
                signal: request.signal,
                lookup: (_hostname, options, callback) => {
                    const cb =
                        typeof options === 'function' ? options : callback;
                    if (typeof cb !== 'function') {
                        return;
                    }
                    if (typeof options !== 'function' && options?.all) {
                        cb(null, [
                            {
                                address: validated.pinnedAddress,
                                family: validated.family,
                            },
                        ]);
                        return;
                    }
                    cb(null, validated.pinnedAddress, validated.family);
                },
            },
            (res) => {
                const chunks: Buffer[] = [];
                res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
                res.on('end', () => {
                    const status = res.statusCode ?? 200;
                    const headers = new Headers();
                    for (const [key, value] of Object.entries(res.headers)) {
                        if (Array.isArray(value)) {
                            for (const item of value) {
                                headers.append(key, item);
                            }
                        } else if (value) {
                            headers.set(key, value);
                        }
                    }
                    resolve(
                        new Response(
                            status === 204 || status === 304
                                ? null
                                : Buffer.concat(chunks),
                            {
                                status,
                                statusText: res.statusMessage,
                                headers,
                            },
                        ),
                    );
                });
            },
        );

        req.on('error', reject);
        req.end(body);
    });
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
