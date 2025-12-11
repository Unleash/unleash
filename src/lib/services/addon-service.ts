import memoizee from 'memoizee';
import joi from 'joi';
const { ValidationError } = joi;
import { getAddons, type IAddonProviders } from '../addons/index.js';
import * as events from '../events/index.js';
import {
    AddonConfigCreatedEvent,
    AddonConfigDeletedEvent,
    AddonConfigUpdatedEvent,
} from '../types/index.js';
import { addonSchema } from './addon-schema.js';
import NameExistsError from '../error/name-exists-error.js';
import type { IFeatureToggleStore } from '../features/feature-toggle/types/feature-toggle-store-type.js';
import type { Logger } from '../logger.js';
import type TagTypeService from '../features/tag-type/tag-type-service.js';
import type {
    IAddon,
    IAddonDto,
    IAddonStore,
} from '../types/stores/addon-store.js';
import {
    type IAuditUser,
    type IUnleashConfig,
    type IUnleashStores,
    SYSTEM_USER_AUDIT,
} from '../types/index.js';
import type { IAddonDefinition } from '../types/model.js';
import { minutesToMilliseconds } from 'date-fns';
import type EventService from '../features/events/event-service.js';
import { omitKeys } from '../util/index.js';
import { BadDataError, NotFoundError } from '../error/index.js';
import type { IntegrationEventsService } from '../features/integration-events/integration-events-service.js';
import type { IEvent } from '../events/index.js';

const SUPPORTED_EVENTS = Object.values(events);

const MASKED_VALUE = '*****';

const WILDCARD_OPTION = '*';

interface ISensitiveParams {
    [key: string]: string[];
}
export default class AddonService {
    addonStore: IAddonStore;

    featureToggleStore: IFeatureToggleStore;

    logger: Logger;

    tagTypeService: TagTypeService;

    eventService: EventService;

    addonProviders: IAddonProviders;

    sensitiveParams: ISensitiveParams;

    fetchAddonConfigs: (() => Promise<IAddon[]>) &
        memoizee.Memoized<() => Promise<IAddon[]>>;

    private eventHandlers: Map<string, (event: IEvent) => Promise<void>>;

    constructor(
        {
            addonStore,
            featureToggleStore,
        }: Pick<IUnleashStores, 'addonStore' | 'featureToggleStore'>,
        {
            getLogger,
            server,
            flagResolver,
            eventBus,
        }: Pick<
            IUnleashConfig,
            'getLogger' | 'server' | 'flagResolver' | 'eventBus'
        >,
        tagTypeService: TagTypeService,
        eventService: EventService,
        integrationEventsService: IntegrationEventsService,
        addons?: IAddonProviders,
    ) {
        this.addonStore = addonStore;
        this.featureToggleStore = featureToggleStore;
        this.logger = getLogger('services/addon-service.js');
        this.tagTypeService = tagTypeService;
        this.eventService = eventService;
        this.eventHandlers = new Map();

        this.addonProviders =
            addons ||
            getAddons({
                getLogger,
                unleashUrl: server.unleashUrl,
                integrationEventsService,
                flagResolver,
                eventBus,
            });
        this.sensitiveParams = this.loadSensitiveParams(this.addonProviders);
        if (addonStore) {
            this.registerEventHandler();
        }

        // Memoized private function
        this.fetchAddonConfigs = memoizee(
            async () => addonStore.getAll({ enabled: true }),
            {
                promise: true,
                maxAge: minutesToMilliseconds(1),
            },
        );
    }

    loadSensitiveParams(addonProviders: IAddonProviders): ISensitiveParams {
        const providerDefinitions = Object.values(addonProviders).map(
            (p) => p.definition,
        );
        return providerDefinitions.reduce((obj, definition) => {
            const sensitiveParams = definition.parameters
                ?.filter((p) => p.sensitive)
                .map((p) => p.name);

            const o = { ...obj };
            o[definition.name] = sensitiveParams;
            return o;
        }, {});
    }

    registerEventHandler(): void {
        SUPPORTED_EVENTS.forEach((eventName) => {
            const handler = this.handleEvent(eventName);
            this.eventHandlers.set(eventName, handler);
            this.eventService.onEvent(eventName, handler);
        });
    }

    handleEvent(eventName: string): (event: IEvent) => Promise<void> {
        const { addonProviders } = this;

        return async (event) => {
            this.logger.warn(`Configuring handler for ${event}`);
            const addonInstances = await this.fetchAddonConfigs();
            const promises = addonInstances
                .filter((addon) => addon.events.includes(eventName))
                .filter(
                    (addon) =>
                        !event.project ||
                        !addon.projects ||
                        addon.projects.length === 0 ||
                        addon.projects[0] === WILDCARD_OPTION ||
                        addon.projects.includes(event.project),
                )
                .filter(
                    (addon) =>
                        !event.environment ||
                        !addon.environments ||
                        addon.environments.length === 0 ||
                        addon.environments[0] === WILDCARD_OPTION ||
                        addon.environments.includes(event.environment),
                )
                .filter((addon) => addonProviders[addon.provider])
                .map((addon) =>
                    addonProviders[addon.provider].handleEvent(
                        event,
                        addon.parameters,
                        addon.id,
                    ),
                );
            await Promise.all(promises);
        };
    }

    // Should be used by the controller.
    async getAddons(): Promise<IAddon[]> {
        const addonConfigs = await this.addonStore.getAll();
        return addonConfigs.map((a) => this.filterSensitiveFields(a));
    }

    filterSensitiveFields(addonConfig: IAddon): IAddon {
        const { sensitiveParams } = this;
        const a = { ...addonConfig };
        a.parameters = Object.keys(a.parameters).reduce((obj, paramKey) => {
            const o = { ...obj };
            if (sensitiveParams[a.provider].includes(paramKey)) {
                o[paramKey] = MASKED_VALUE;
            } else {
                o[paramKey] = a.parameters[paramKey];
            }

            return o;
        }, {});
        return a;
    }

    async getAddon(id: number): Promise<IAddon> {
        const addonConfig = await this.addonStore.get(id);
        if (addonConfig === undefined) {
            throw new NotFoundError();
        }
        return this.filterSensitiveFields(addonConfig);
    }

    getProviderDefinitions(): IAddonDefinition[] {
        const { addonProviders } = this;
        return Object.values(addonProviders).map((p) => p.definition);
    }

    async addTagTypes(providerName: string): Promise<void> {
        const provider = this.addonProviders[providerName];
        if (provider) {
            const tagTypes = provider.definition.tagTypes || [];
            const createTags = tagTypes.map(async (tagType) => {
                try {
                    await this.tagTypeService.validateUnique(tagType.name);
                    await this.tagTypeService.createTagType(
                        tagType,
                        SYSTEM_USER_AUDIT,
                    );
                } catch (err) {
                    if (!(err instanceof NameExistsError)) {
                        this.logger.error(err);
                    }
                }
            });
            await Promise.all(createTags);
        }
        return Promise.resolve();
    }

    async createAddon(data: IAddonDto, auditUser: IAuditUser): Promise<IAddon> {
        const addonConfig = await addonSchema.validateAsync(data);
        await this.validateKnownProvider(addonConfig);
        await this.validateRequiredParameters(addonConfig);
        const addon = this.addonProviders[addonConfig.provider];
        if (addon.definition.deprecated) {
            throw new BadDataError(addon.definition.deprecated);
        }

        const createdAddon = await this.addonStore.insert(addonConfig);
        await this.addTagTypes(createdAddon.provider);

        this.logger.info(
            `User ${auditUser.username} created addon ${addonConfig.provider}`,
        );

        await this.eventService.storeEvent(
            new AddonConfigCreatedEvent({
                data: omitKeys(createdAddon, 'parameters'),
                auditUser,
            }),
        );

        return createdAddon;
    }

    async updateAddon(
        id: number,
        data: IAddonDto,
        auditUser: IAuditUser,
    ): Promise<IAddon> {
        const existingConfig = await this.addonStore.get(id);
        if (existingConfig === undefined) {
            throw new NotFoundError();
        } // because getting an early 404 here makes more sense
        const addonConfig = await addonSchema.validateAsync(data);
        await this.validateKnownProvider(addonConfig);
        await this.validateRequiredParameters(addonConfig);
        if (this.sensitiveParams[addonConfig.provider].length > 0) {
            addonConfig.parameters = Object.keys(addonConfig.parameters).reduce(
                (params, key) => {
                    const o = { ...params };
                    if (addonConfig.parameters[key] === MASKED_VALUE) {
                        o[key] = existingConfig.parameters[key];
                    } else {
                        o[key] = addonConfig.parameters[key];
                    }
                    return o;
                },
                {},
            );
        }
        const result = await this.addonStore.update(id, addonConfig);
        await this.eventService.storeEvent(
            new AddonConfigUpdatedEvent({
                preData: omitKeys(existingConfig, 'parameters'),
                data: omitKeys(result, 'parameters'),
                auditUser,
            }),
        );
        this.logger.info(`User ${auditUser} updated addon ${id}`);
        return result;
    }

    async removeAddon(id: number, auditUser: IAuditUser): Promise<void> {
        const existingConfig = await this.addonStore.get(id);
        if (existingConfig === undefined) {
            /// No config, no need to delete
            return;
        }
        await this.addonStore.delete(id);
        await this.eventService.storeEvent(
            new AddonConfigDeletedEvent({
                preData: omitKeys(existingConfig, 'parameters'),
                auditUser,
            }),
        );
        this.logger.info(`User ${auditUser} removed addon ${id}`);
    }

    async validateKnownProvider(config: Partial<IAddonDto>): Promise<boolean> {
        if (!config.provider) {
            throw new ValidationError(
                'No addon provider supplied. The property was either missing or an empty value.',
                [],
                undefined,
            );
        }

        const p = this.addonProviders[config.provider];
        if (!p) {
            throw new ValidationError(
                `Unknown addon provider ${config.provider}`,
                [],
                undefined,
            );
        } else {
            return true;
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async validateRequiredParameters({
        provider,
        parameters,
    }): Promise<boolean> {
        const providerDefinition = this.addonProviders[provider].definition;

        const requiredParamsMissing =
            providerDefinition.parameters
                ?.filter((p) => p.required)
                .map((p) => p.name)
                .filter(
                    (requiredParam) =>
                        !Object.keys(parameters).includes(requiredParam),
                ) || [];
        if (requiredParamsMissing.length > 0) {
            throw new ValidationError(
                `Missing required parameters: ${requiredParamsMissing.join(
                    ',',
                )} `,
                [],
                undefined,
            );
        }
        return true;
    }

    destroy(): void {
        this.eventHandlers.forEach((handler, eventName) => {
            try {
                this.eventService.off(eventName, handler);
            } catch (error) {
                this.logger.debug(
                    `Failed to remove event handler for ${eventName}:`,
                    error,
                );
            }
        });
        this.eventHandlers.clear();

        Object.values(this.addonProviders).forEach((addon) => {
            addon.destroy?.();
        });
    }
}
