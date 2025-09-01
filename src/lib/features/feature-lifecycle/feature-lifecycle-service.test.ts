import {
    CLIENT_METRICS_ADDED,
    FEATURE_ARCHIVED,
    FEATURE_CREATED,
    FEATURE_REVIVED,
} from '../../events/index.js';
import type {
    IEnvironment,
    IUnleashConfig,
    StageName,
} from '../../types/index.js';
import { createFakeFeatureLifecycleService } from './createFeatureLifecycle.js';
import EventEmitter from 'events';
import noLoggerProvider from '../../../test/fixtures/no-logger.js';
import { STAGE_ENTERED } from '../../metric-events.js';

test('can insert and read lifecycle stages', async () => {
    const eventBus = new EventEmitter();
    const {
        featureLifecycleService,
        eventStore,
        environmentStore,
        featureEnvironmentStore,
    } = createFakeFeatureLifecycleService({
        flagResolver: { isEnabled: () => true },
        eventBus,
        getLogger: noLoggerProvider,
    } as unknown as IUnleashConfig);
    const featureName = 'testFeature';
    await featureEnvironmentStore.addEnvironmentToFeature(
        featureName,
        'my-prod-environment',
        true,
    );

    function emitMetricsEvent(environment: string) {
        eventBus.emit(CLIENT_METRICS_ADDED, [
            {
                featureName,
                environment,
            },
        ]);
    }
    function reachedStage(feature: string, name: StageName) {
        return new Promise((resolve) =>
            eventBus.on(STAGE_ENTERED, (event) => {
                if (event.stage === name && event.feature === feature)
                    resolve(name);
            }),
        );
    }

    await environmentStore.create({
        name: 'my-dev-environment',
        type: 'test',
    } as IEnvironment);
    await environmentStore.create({
        name: 'my-prod-environment',
        type: 'production',
    } as IEnvironment);
    await environmentStore.create({
        name: 'my-another-dev-environment',
        type: 'development',
    } as IEnvironment);
    await environmentStore.create({
        name: 'my-another-prod-environment',
        type: 'production',
    } as IEnvironment);
    featureLifecycleService.listen();

    eventStore.emit(FEATURE_CREATED, { featureName });
    await reachedStage(featureName, 'initial');

    emitMetricsEvent('unknown-environment');
    emitMetricsEvent('my-dev-environment');
    await reachedStage(featureName, 'pre-live');
    emitMetricsEvent('my-dev-environment');
    emitMetricsEvent('my-another-dev-environment');
    emitMetricsEvent('my-prod-environment');
    await reachedStage(featureName, 'live');
    emitMetricsEvent('my-prod-environment');
    emitMetricsEvent('my-another-prod-environment');

    eventStore.emit(FEATURE_ARCHIVED, { featureName });
    await reachedStage(featureName, 'archived');

    const lifecycle =
        await featureLifecycleService.getFeatureLifecycle(featureName);

    expect(lifecycle).toEqual([
        { stage: 'initial', enteredStageAt: expect.any(Date) },
        { stage: 'pre-live', enteredStageAt: expect.any(Date) },
        { stage: 'live', enteredStageAt: expect.any(Date) },
        { stage: 'archived', enteredStageAt: expect.any(Date) },
    ]);

    eventStore.emit(FEATURE_REVIVED, { featureName });
    await reachedStage(featureName, 'initial');
    const initialLifecycle =
        await featureLifecycleService.getFeatureLifecycle(featureName);
    expect(initialLifecycle).toEqual([
        { stage: 'initial', enteredStageAt: expect.any(Date) },
    ]);
});
