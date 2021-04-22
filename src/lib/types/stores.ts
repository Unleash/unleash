import { Knex } from 'knex';
import ProjectStore from '../db/project-store';
import EventStore from '../db/event-store';
import FeatureTypeStore from '../db/feature-type-store';
import StrategyStore from '../db/strategy-store';
import ClientApplicationsDb from '../db/client-applications-store';
import ClientInstanceStore from '../db/client-instance-store';
import ClientMetricsStore from '../db/client-metrics-store';
import FeatureToggleStore from '../db/feature-toggle-store';
import ContextFieldStore from '../db/context-field-store';
import SettingStore from '../db/setting-store';
import UserStore from '../db/user-store';
import TagStore from '../db/tag-store';
import TagTypeStore from '../db/tag-type-store';
import AddonStore from '../db/addon-store';
import { AccessStore } from '../db/access-store';
import { ApiTokenStore } from '../db/api-token-store';
import { ResetTokenStore } from '../db/reset-token-store';

export interface IUnleashStores {
    projectStore: ProjectStore;
    eventStore: EventStore;
    featureTypeStore: FeatureTypeStore;
    strategyStore: StrategyStore;
    clientApplicationsStore: ClientApplicationsDb;
    clientInstanceStore: ClientInstanceStore;
    clientMetricsStore: ClientMetricsStore;
    featureToggleStore: FeatureToggleStore;
    contextFieldStore: ContextFieldStore;
    settingStore: SettingStore;
    userStore: UserStore;
    tagStore: TagStore;
    tagTypeStore: TagTypeStore;
    addonStore: AddonStore;
    accessStore: AccessStore;
    apiTokenStore: ApiTokenStore;
    resetTokenStore: ResetTokenStore;
    db: Knex;
}
