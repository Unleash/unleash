'use strict';

const memoize = require('memoizee');
const { ValidationError } = require('joi');
const addonProvidersClasses = require('../addons');
const events = require('../event-type');
const { addonSchema } = require('./addon-schema');
const NameExistsError = require('../error/name-exists-error');

const SUPPORTED_EVENTS = Object.keys(events).map(k => events[k]);

const ADDONS_CACHE_TIME = 60 * 1000; // 60s

const MASKED_VALUE = '*****';

class AddonService {
    constructor(
        { addonStore, eventStore, featureToggleStore },
        { getLogger, unleashUrl },
        tagTypeService,
    ) {
        this.eventStore = eventStore;
        this.addonStore = addonStore;
        this.featureToggleStore = featureToggleStore;
        this.getLogger = getLogger;
        this.logger = getLogger('services/addon-service.js');
        this.tagTypeService = tagTypeService;

        this.addonProviders = this.loadProviders({
            getLogger,
            unleashUrl,
        });
        this.sensitiveParams = this.loadSensitiveParams(this.addonProviders);
        if (addonStore) {
            this.registerEventHandler();
        }

        // Memoized private function
        this.fetchAddonConfigs = memoize(
            () => addonStore.getAll({ enabled: true }),
            { promise: true, maxAge: ADDONS_CACHE_TIME },
        );
    }

    loadProviders(config) {
        return addonProvidersClasses.reduce((map, Provider) => {
            try {
                const provider = new Provider(config);
                // eslint-disable-next-line no-param-reassign
                map[provider.name] = provider;
            } finally {
                // Do nothing
            }
            return map;
        }, {});
    }

    loadSensitiveParams(addonProviders) {
        const providerDefinitions = Object.values(addonProviders).map(
            p => p.definition,
        );
        return providerDefinitions.reduce((obj, definition) => {
            const sensitiveParams = definition.parameters
                .filter(p => p.sensitive)
                .map(p => p.name);

            const o = { ...obj };
            o[definition.name] = sensitiveParams;
            return o;
        }, {});
    }

    registerEventHandler() {
        SUPPORTED_EVENTS.forEach(eventName =>
            this.eventStore.on(eventName, this.handleEvent(eventName)),
        );
    }

    handleEvent(eventName) {
        const { addonProviders } = this;
        return event => {
            this.fetchAddonConfigs().then(addonInstances => {
                addonInstances
                    .filter(addon => addon.events.includes(eventName))
                    .filter(addon => addonProviders[addon.provider])
                    .forEach(addon =>
                        addonProviders[addon.provider].handleEvent(
                            event,
                            addon.parameters,
                        ),
                    );
            });
        };
    }

    // Should be used by the controller.
    async getAddons() {
        const addonConfigs = await this.addonStore.getAll();
        return addonConfigs.map(a => this.filterSensitiveFields(a));
    }

    filterSensitiveFields(addonConfig) {
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

    async getAddon(id) {
        const addonConfig = await this.addonStore.get(id);
        return this.filterSensitiveFields(addonConfig);
    }

    getProviderDefinition() {
        const { addonProviders } = this;
        return Object.values(addonProviders).map(p => p.definition);
    }

    async addTagTypes(providerName) {
        const provider = this.addonProviders[providerName];
        if (provider) {
            const tagTypes = provider.definition.tagTypes || [];
            const createTags = tagTypes.map(async tagType => {
                try {
                    await this.tagTypeService.validateUnique(tagType);
                    await this.tagTypeService.createTagType(tagType);
                } catch (err) {
                    this.logger.error(err);
                    if (!(err instanceof NameExistsError)) {
                        this.logger.error(err);
                    }
                }
            });
            return Promise.all(createTags);
        }
        return Promise.resolve();
    }

    async createAddon(data, userName) {
        const addonConfig = await addonSchema.validateAsync(data);
        await this.validateKnownProvider(addonConfig);
        await this.validateRequiredParameters(addonConfig);

        const createdAddon = await this.addonStore.insert(addonConfig);
        await this.addTagTypes(createdAddon.provider);

        this.logger.info(
            `User ${userName} created addon ${addonConfig.provider}`,
        );

        await this.eventStore.store({
            type: events.ADDON_CONFIG_CREATED,
            createdBy: userName,
            data: { provider: addonConfig.provider },
        });

        return createdAddon;
    }

    async updateAddon(id, data, userName) {
        const addonConfig = await addonSchema.validateAsync(data);
        await this.validateRequiredParameters(addonConfig);
        if (this.sensitiveParams[addonConfig.provider].length > 0) {
            const existingConfig = await this.addonStore.get(id);
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
        await this.addonStore.update(id, addonConfig);
        await this.eventStore.store({
            type: events.ADDON_CONFIG_UPDATED,
            createdBy: userName,
            data: { id, provider: addonConfig.provider },
        });
        this.logger.info(`User ${userName} updated addon ${id}`);
    }

    async removeAddon(id, userName) {
        await this.addonStore.delete(id);
        await this.eventStore.store({
            type: events.ADDON_CONFIG_DELETED,
            createdBy: userName,
            data: { id },
        });
        this.logger.info(`User ${userName} removed addon ${id}`);
    }

    async validateKnownProvider(config) {
        const p = this.addonProviders[config.provider];
        if (!p) {
            throw new TypeError(`Unknown addon provider ${config.provider}`);
        } else {
            return true;
        }
    }

    async validateRequiredParameters({ provider, parameters }) {
        const providerDefinition = this.addonProviders[provider].definition;

        const requiredParamsMissing = providerDefinition.parameters
            .filter(p => p.required)
            .map(p => p.name)
            .filter(
                requiredParam =>
                    !Object.keys(parameters).includes(requiredParam),
            );
        if (requiredParamsMissing.length > 0) {
            throw new ValidationError(
                `Missing required parameters: ${requiredParamsMissing.join(
                    ',',
                )} `,
                '',
            );
        }
        return true;
    }
}

module.exports = AddonService;
