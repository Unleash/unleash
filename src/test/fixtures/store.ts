import FakeFeatureStrategiesStore from './fake-feature-strategies-store';
import FakeClientMetricsStore from './fake-client-metrics-store';
import FakeClientInstanceStore from './fake-client-instance-store';
import FakeClientApplicationsStore from './fake-client-applications-store';
import FakeFeatureToggleStore from './fake-feature-toggle-store';
import FakeTagStore from './fake-tag-store';
import FakeTagTypeStore from './fake-tag-type-store';
import FakeEventStore from './fake-event-store';
import FakeContextFieldStore from './fake-context-field-store';
import FakeSettingStore from './fake-setting-store';
import FakeAddonStore from './fake-addon-store';
import FakeProjectStore from './fake-project-store';
import FakeUserStore from './fake-user-store';
import FakeAccessStore from './fake-access-store';
import FakeUserFeedbackStore from './fake-user-feedback-store';
import FakeFeatureTagStore from './fake-feature-tag-store';
import FakeEnvironmentStore from './fake-environment-store';
import FakeStrategiesStore from './fake-strategies-store';
import { IUnleashStores } from '../../lib/types';
import FakeSessionStore from './fake-session-store';
import FakeFeatureEnvironmentStore from './fake-feature-environment-store';
import FakeApiTokenStore from './fake-api-token-store';
import FakeFeatureTypeStore from './fake-feature-type-store';
import FakeResetTokenStore from './fake-reset-token-store';
import FakeFeatureToggleClientStore from './fake-feature-toggle-client-store';

const createStores: () => IUnleashStores = () => {
    const db = {
        select: () => ({
            from: () => Promise.resolve(),
        }),
    };

    return {
        db,
        clientApplicationsStore: new FakeClientApplicationsStore(),
        clientMetricsStore: new FakeClientMetricsStore(),
        clientInstanceStore: new FakeClientInstanceStore(),
        featureToggleStore: new FakeFeatureToggleStore(),
        featureToggleClientStore: new FakeFeatureToggleClientStore(),
        tagStore: new FakeTagStore(),
        tagTypeStore: new FakeTagTypeStore(),
        eventStore: new FakeEventStore(),
        strategyStore: new FakeStrategiesStore(),
        contextFieldStore: new FakeContextFieldStore(),
        settingStore: new FakeSettingStore(),
        addonStore: new FakeAddonStore(),
        projectStore: new FakeProjectStore(),
        userStore: new FakeUserStore(),
        accessStore: new FakeAccessStore(),
        userFeedbackStore: new FakeUserFeedbackStore(),
        featureStrategiesStore: new FakeFeatureStrategiesStore(),
        featureTagStore: new FakeFeatureTagStore(),
        environmentStore: new FakeEnvironmentStore(),
        featureEnvironmentStore: new FakeFeatureEnvironmentStore(),
        apiTokenStore: new FakeApiTokenStore(),
        featureTypeStore: new FakeFeatureTypeStore(),
        resetTokenStore: new FakeResetTokenStore(),
        sessionStore: new FakeSessionStore(),
    };
};

export default createStores;
