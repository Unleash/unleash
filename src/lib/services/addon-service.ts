import memoizee from 'memoizee';
import { ValidationError } from 'joi';
import { getAddons, type IAddonProviders } from '../addons';
import * as events from '../types/events';
import {
    AddonConfigCreatedEvent,
    AddonConfigDeletedEvent,
    AddonConfigUpdatedEvent,
} from '../types/events';
import { addonSchema } from './addon-schema';
import NameExistsError from '../error/name-exists-error';
import type { IFeatureToggleStore } from '../features/feature-toggle/types/feature-toggle-store-type';
import type { Logger } from '../logger';
import type TagTypeService from '../features/tag-type/tag-type-service';
import type {
    IAddon,
    IAddonDto,
    IAddonStore,
} from '../types/stores/addon-store';
import {
    type IAuditUser,
    type IUnleashConfig,
    type IUnleashStores,
    SYSTEM_USER_AUDIT,
} from '../types';
import type { IAddonDefinition } from '../types/model';
import { minutesToMilliseconds } from 'date-fns';
import type EventService from '../features/events/event-service';
import { omitKeys } from '../util';

const SUPPORTED_EVENTS = Object.keys(events).map((k) => events[k]);

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
        integrationEventsService,
        addons?: IAddonProviders,
    ) {
        this.addonStore = addonStore;
        this.featureToggleStore = featureToggleStore;
        this.logger = getLogger('services/addon-service.js');
        this.tagTypeService = tagTypeService;
        this.eventService = eventService;

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
                .filter((p) => p.sensitive)
                .map((p) => p.name);

            const o = { ...obj };
            o[definition.name] = sensitiveParams;
            return o;
        }, {});
    }

    registerEventHandler(): void {
        SUPPORTED_EVENTS.forEach((eventName) =>
            this.eventService.onEvent(eventName, this.handleEvent(eventName)),
        );
    }

    handleEvent(eventName: string): (IEvent) => void {
        const { addonProviders } = this;
        return (event) => {
            this.fetchAddonConfigs().then((addonInstances) => {
                addonInstances
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
                    .forEach((addon) =>
                        addonProviders[addon.provider].handleEvent(
                            event,
                            addon.parameters,
                            addon.id,
                        ),
                    );
            });
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
        const existingConfig = await this.addonStore.get(id); // because getting an early 404 here makes more sense
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

        const requiredParamsMissing = providerDefinition.parameters
            .filter((p) => p.required)
            .map((p) => p.name)
            .filter(
                (requiredParam) =>
                    !Object.keys(parameters).includes(requiredParam),
            );
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
        Object.values(this.addonProviders).forEach((addon) =>
            addon.destroy?.(),
        );
    }
}
