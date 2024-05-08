import {
    CLIENT_METRICS,
    FEATURE_ARCHIVED,
    FEATURE_COMPLETED,
    FEATURE_CREATED,
    FEATURE_REVIVED,
    type IEnvironment,
    type IUnleashConfig,
    type StageName,
} from '../../types';
import { createFakeFeatureLifecycleService } from './createFeatureLifecycle';
import EventEmitter from 'events';
import { STAGE_ENTERED } from './feature-lifecycle-service';
import noLoggerProvider from '../../../test/fixtures/no-logger';

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
        eventBus.emit(CLIENT_METRICS, {
            bucket: { toggles: { [featureName]: 'irrelevant' } },
            environment,
        });
    }
    function reachedStage(name: StageName) {
        return new Promise((resolve) =>
            featureLifecycleService.on(STAGE_ENTERED, (event) => {
                if (event.stage === name) resolve(name);
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
    await reachedStage('initial');

    emitMetricsEvent('unknown-environment');
    emitMetricsEvent('my-dev-environment');
    await reachedStage('pre-live');
    emitMetricsEvent('my-dev-environment');
    emitMetricsEvent('my-another-dev-environment');
    emitMetricsEvent('my-prod-environment');
    await reachedStage('live');
    emitMetricsEvent('my-prod-environment');
    emitMetricsEvent('my-another-prod-environment');

    eventStore.emit(FEATURE_ARCHIVED, { featureName });
    await reachedStage('archived');

    const lifecycle =
        await featureLifecycleService.getFeatureLifecycle(featureName);

    expect(lifecycle).toEqual([
        { stage: 'initial', enteredStageAt: expect.any(Date) },
        { stage: 'pre-live', enteredStageAt: expect.any(Date) },
        { stage: 'live', enteredStageAt: expect.any(Date) },
        { stage: 'archived', enteredStageAt: expect.any(Date) },
    ]);

    eventStore.emit(FEATURE_REVIVED, { featureName });
    await reachedStage('initial');
    const initialLifecycle =
        await featureLifecycleService.getFeatureLifecycle(featureName);
    expect(initialLifecycle).toEqual([
        { stage: 'initial', enteredStageAt: expect.any(Date) },
    ]);
});

test('ignores lifecycle state updates when flag disabled', async () => {
    const eventBus = new EventEmitter();
    const { featureLifecycleService, eventStore, environmentStore } =
        createFakeFeatureLifecycleService({
            flagResolver: { isEnabled: () => false },
            eventBus,
            getLogger: noLoggerProvider,
        } as unknown as IUnleashConfig);
    const featureName = 'testFeature';

    await environmentStore.create({
        name: 'my-dev-environment',
        type: 'development',
    } as IEnvironment);
    featureLifecycleService.listen();

    await eventStore.emit(FEATURE_CREATED, { featureName });
    await eventStore.emit(FEATURE_COMPLETED, { featureName });
    await eventBus.emit(CLIENT_METRICS, {
        bucket: { toggles: { [featureName]: 'irrelevant' } },
        environment: 'development',
    });
    await eventStore.emit(FEATURE_ARCHIVED, { featureName });

    const lifecycle =
        await featureLifecycleService.getFeatureLifecycle(featureName);

    expect(lifecycle).toEqual([]);
});

test('can find feature lifecycle stage timings', async () => {
    const eventBus = new EventEmitter();
    const { featureLifecycleService, eventStore, environmentStore } =
        createFakeFeatureLifecycleService({
            flagResolver: { isEnabled: () => false },
            eventBus,
            getLogger: noLoggerProvider,
        } as unknown as IUnleashConfig);
    const now = new Date();
    const minusOneMinute = new Date(now.getTime() - 1 * 60 * 1000);
    const minusTenMinutes = new Date(now.getTime() - 10 * 60 * 1000);
    const durations = featureLifecycleService.calculateStageDurations([
        {
            feature: 'a',
            stage: 'initial',
            enteredStageAt: minusTenMinutes,
        },
        {
            feature: 'b',
            stage: 'initial',
            enteredStageAt: minusTenMinutes,
        },
        {
            feature: 'a',
            stage: 'pre-live',
            enteredStageAt: minusOneMinute,
        },
        {
            feature: 'b',
            stage: 'live',
            enteredStageAt: minusOneMinute,
        },
        {
            feature: 'c',
            stage: 'initial',
            enteredStageAt: minusTenMinutes,
        },
    ]);

    expect(durations).toMatchObject([
        {
            feature: 'a',
            stage: 'initial',
            duration: 9,
        },
        {
            feature: 'a',
            stage: 'pre-live',
            duration: 1,
        },
        {
            feature: 'b',
            stage: 'initial',
            duration: 9,
        },
        {
            feature: 'b',
            stage: 'live',
            duration: 1,
        },
        {
            feature: 'c',
            stage: 'initial',
            duration: 10,
        },
    ]);
});
