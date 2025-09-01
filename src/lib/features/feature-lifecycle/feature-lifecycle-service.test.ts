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

function emitMetricsEvent(
    eventBus: EventEmitter,
    featureName: string,
    environment: string,
) {
    eventBus.emit(CLIENT_METRICS_ADDED, [
        {
            featureName,
            environment,
        },
    ]);
}

function reachedStage(
    eventBus: EventEmitter,
    feature: string,
    name: StageName,
) {
    return new Promise((resolve) =>
        eventBus.on(STAGE_ENTERED, (event) => {
            if (event.stage === name && event.feature === feature)
                resolve(name);
        }),
    );
}

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
    await reachedStage(eventBus, featureName, 'initial');

    emitMetricsEvent(eventBus, featureName, 'unknown-environment');
    emitMetricsEvent(eventBus, featureName, 'my-dev-environment');
    await reachedStage(eventBus, featureName, 'pre-live');
    emitMetricsEvent(eventBus, featureName, 'my-dev-environment');
    emitMetricsEvent(eventBus, featureName, 'my-another-dev-environment');
    emitMetricsEvent(eventBus, featureName, 'my-prod-environment');
    await reachedStage(eventBus, featureName, 'live');
    emitMetricsEvent(eventBus, featureName, 'my-prod-environment');
    emitMetricsEvent(eventBus, featureName, 'my-another-prod-environment');

    eventStore.emit(FEATURE_ARCHIVED, { featureName });
    await reachedStage(eventBus, featureName, 'archived');

    const lifecycle =
        await featureLifecycleService.getFeatureLifecycle(featureName);

    expect(lifecycle).toEqual([
        { stage: 'initial', enteredStageAt: expect.any(Date) },
        { stage: 'pre-live', enteredStageAt: expect.any(Date) },
        { stage: 'live', enteredStageAt: expect.any(Date) },
        { stage: 'archived', enteredStageAt: expect.any(Date) },
    ]);

    eventStore.emit(FEATURE_REVIVED, { featureName });
    await reachedStage(eventBus, featureName, 'initial');
    const initialLifecycle =
        await featureLifecycleService.getFeatureLifecycle(featureName);
    expect(initialLifecycle).toEqual([
        { stage: 'initial', enteredStageAt: expect.any(Date) },
    ]);
});

test('handles bulk metrics efficiently with multiple environments and features', async () => {
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

    await environmentStore.create({
        name: 'dev-env',
        type: 'development',
    } as IEnvironment);

    await environmentStore.create({
        name: 'staging-env',
        type: 'staging',
    } as IEnvironment);

    await environmentStore.create({
        name: 'prod-env',
        type: 'production',
    } as IEnvironment);

    const feature1 = 'feature-1';
    const feature2 = 'feature-2';
    const feature3 = 'feature-3';

    await featureEnvironmentStore.addEnvironmentToFeature(
        feature1,
        'dev-env',
        false,
    );
    await featureEnvironmentStore.addEnvironmentToFeature(
        feature1,
        'staging-env',
        false,
    );
    await featureEnvironmentStore.addEnvironmentToFeature(
        feature1,
        'prod-env',
        true,
    );

    await featureEnvironmentStore.addEnvironmentToFeature(
        feature2,
        'dev-env',
        true,
    );
    await featureEnvironmentStore.addEnvironmentToFeature(
        feature2,
        'staging-env',
        false,
    );
    await featureEnvironmentStore.addEnvironmentToFeature(
        feature2,
        'prod-env',
        false,
    );

    await featureEnvironmentStore.addEnvironmentToFeature(
        feature3,
        'dev-env',
        false,
    );
    await featureEnvironmentStore.addEnvironmentToFeature(
        feature3,
        'staging-env',
        true,
    );
    await featureEnvironmentStore.addEnvironmentToFeature(
        feature3,
        'prod-env',
        true,
    );

    featureLifecycleService.listen();

    eventStore.emit(FEATURE_CREATED, { featureName: feature1 });
    eventStore.emit(FEATURE_CREATED, { featureName: feature2 });
    eventStore.emit(FEATURE_CREATED, { featureName: feature3 });

    const bulkMetricsEvent = [
        {
            featureName: feature1,
            environment: 'dev-env',
            appName: 'test-app',
            timestamp: new Date(),
            yes: 10,
            no: 5,
        },
        {
            featureName: feature2,
            environment: 'dev-env',
            appName: 'test-app',
            timestamp: new Date(),
            yes: 15,
            no: 3,
        },
        {
            featureName: feature3,
            environment: 'dev-env',
            appName: 'test-app',
            timestamp: new Date(),
            yes: 8,
            no: 2,
        },
        {
            featureName: feature1,
            environment: 'staging-env',
            appName: 'test-app',
            timestamp: new Date(),
            yes: 20,
            no: 10,
        },
        {
            featureName: feature2,
            environment: 'staging-env',
            appName: 'test-app',
            timestamp: new Date(),
            yes: 12,
            no: 6,
        },
        {
            featureName: feature3,
            environment: 'staging-env',
            appName: 'test-app',
            timestamp: new Date(),
            yes: 25,
            no: 5,
        },
        {
            featureName: feature1,
            environment: 'prod-env',
            appName: 'test-app',
            timestamp: new Date(),
            yes: 100,
            no: 20,
        },
        {
            featureName: feature2,
            environment: 'prod-env',
            appName: 'test-app',
            timestamp: new Date(),
            yes: 80,
            no: 15,
        },
        {
            featureName: feature3,
            environment: 'prod-env',
            appName: 'test-app',
            timestamp: new Date(),
            yes: 150,
            no: 30,
        },
    ];

    eventBus.emit(CLIENT_METRICS_ADDED, bulkMetricsEvent);

    await new Promise((resolve) => setTimeout(resolve, 50));

    const lifecycle1 =
        await featureLifecycleService.getFeatureLifecycle(feature1);
    const lifecycle2 =
        await featureLifecycleService.getFeatureLifecycle(feature2);
    const lifecycle3 =
        await featureLifecycleService.getFeatureLifecycle(feature3);

    expect(lifecycle1.some((stage) => stage.stage === 'initial')).toBe(true);
    expect(lifecycle2.some((stage) => stage.stage === 'initial')).toBe(true);
    expect(lifecycle3.some((stage) => stage.stage === 'initial')).toBe(true);

    expect(lifecycle1.length).toBeGreaterThan(1);
    expect(lifecycle2.length).toBeGreaterThan(1);
    expect(lifecycle3.length).toBeGreaterThan(1);
});

test('handles bulk metrics with unknown environments gracefully', async () => {
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

    await environmentStore.create({
        name: 'known-env',
        type: 'development',
    } as IEnvironment);

    const feature = 'test-feature';
    await featureEnvironmentStore.addEnvironmentToFeature(
        feature,
        'known-env',
        false,
    );

    featureLifecycleService.listen();
    eventStore.emit(FEATURE_CREATED, { featureName: feature });
    await reachedStage(eventBus, feature, 'initial');

    const metricsWithUnknownEnv = [
        {
            featureName: feature,
            environment: 'known-env',
            appName: 'test-app',
            timestamp: new Date(),
            yes: 10,
            no: 5,
        },
        {
            featureName: feature,
            environment: 'unknown-env',
            appName: 'test-app',
            timestamp: new Date(),
            yes: 5,
            no: 2,
        },
    ];

    eventBus.emit(CLIENT_METRICS_ADDED, metricsWithUnknownEnv);

    await reachedStage(eventBus, feature, 'pre-live');

    const lifecycle =
        await featureLifecycleService.getFeatureLifecycle(feature);
    expect(lifecycle).toEqual([
        { stage: 'initial', enteredStageAt: expect.any(Date) },
        { stage: 'pre-live', enteredStageAt: expect.any(Date) },
    ]);
});
