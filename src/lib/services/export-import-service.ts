import { IUnleashConfig } from '../types/option';
import { FeatureToggle, ITag } from '../types/model';
import { Logger } from '../logger';
import { IFeatureTagStore } from '../types/stores/feature-tag-store';
import { IProjectStore } from '../types/stores/project-store';
import { ITagTypeStore } from '../types/stores/tag-type-store';
import { ITagStore } from '../types/stores/tag-store';
import { IEventStore } from '../types/stores/event-store';
import { IStrategyStore } from '../types/stores/strategy-store';
import { IFeatureToggleStore } from '../types/stores/feature-toggle-store';
import { IFeatureStrategiesStore } from '../types/stores/feature-strategies-store';
import { IEnvironmentStore } from '../types/stores/environment-store';
import { IFeatureEnvironmentStore } from '../types/stores/feature-environment-store';
import { IUnleashStores } from '../types/stores';
import { ISegmentStore } from '../types/stores/segment-store';
import { IFlagResolver } from 'lib/types';
import { IContextFieldDto } from '../types/stores/context-field-store';

export interface IExportQuery {
    features: string[];
    environment: string;
}

export interface IExportData {
    features: FeatureToggle[];
    tags?: ITag[];
    contextFields?: IContextFieldDto[];
}

export default class ExportImportService {
    private logger: Logger;

    private toggleStore: IFeatureToggleStore;

    private featureStrategiesStore: IFeatureStrategiesStore;

    private strategyStore: IStrategyStore;

    private eventStore: IEventStore;

    private tagStore: ITagStore;

    private tagTypeStore: ITagTypeStore;

    private projectStore: IProjectStore;

    private featureEnvironmentStore: IFeatureEnvironmentStore;

    private featureTagStore: IFeatureTagStore;

    private environmentStore: IEnvironmentStore;

    private segmentStore: ISegmentStore;

    private flagResolver: IFlagResolver;

    constructor(
        stores: IUnleashStores,
        {
            getLogger,
            flagResolver,
        }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
    ) {
        this.eventStore = stores.eventStore;
        this.toggleStore = stores.featureToggleStore;
        this.strategyStore = stores.strategyStore;
        this.tagStore = stores.tagStore;
        this.featureStrategiesStore = stores.featureStrategiesStore;
        this.featureEnvironmentStore = stores.featureEnvironmentStore;
        this.tagTypeStore = stores.tagTypeStore;
        this.projectStore = stores.projectStore;
        this.featureTagStore = stores.featureTagStore;
        this.environmentStore = stores.environmentStore;
        this.segmentStore = stores.segmentStore;
        this.flagResolver = flagResolver;
        this.logger = getLogger('services/state-service.js');
    }

    async export(query: IExportQuery): Promise<IExportData> {
        const features = (
            await this.toggleStore.getAll({ archived: false })
        ).filter((toggle) => query.features.includes(toggle.name));
        return { features: features };
    }
}

module.exports = ExportImportService;
