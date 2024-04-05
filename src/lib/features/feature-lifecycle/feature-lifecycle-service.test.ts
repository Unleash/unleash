import {
    CLIENT_METRICS,
    FEATURE_ARCHIVED,
    FEATURE_COMPLETED,
    FEATURE_CREATED,
    type IEnvironment,
    type IUnleashConfig,
} from '../../types';
import { createFakeFeatureLifecycleService } from './createFeatureLifecycle';
import EventEmitter from 'events';

function ms(timeMs) {
    return new Promise((resolve) => setTimeout(resolve, timeMs));
}

test('can insert and read lifecycle stages', async () => {
    const eventBus = new EventEmitter();
    const { featureLifecycleService, eventStore, environmentStore } =
        createFakeFeatureLifecycleService({
            flagResolver: { isEnabled: () => true },
            eventBus,
        } as unknown as IUnleashConfig);
    const featureName = 'testFeature';

    async function emitMetricsEvent(environment: string) {
        await eventBus.emit(CLIENT_METRICS, { featureName, environment });
        await ms(1);
    }

    await environmentStore.create({
        name: 'my-dev-environment',
        type: 'development',
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

    await eventStore.emit(FEATURE_CREATED, { featureName });

    await emitMetricsEvent('unknown-environment');
    await emitMetricsEvent('my-dev-environment');
    await emitMetricsEvent('my-dev-environment');
    await emitMetricsEvent('my-another-dev-environment');
    await emitMetricsEvent('my-prod-environment');
    await emitMetricsEvent('my-prod-environment');
    await emitMetricsEvent('my-another-prod-environment');

    await eventStore.emit(FEATURE_COMPLETED, { featureName });
    await eventStore.emit(FEATURE_ARCHIVED, { featureName });

    const lifecycle =
        await featureLifecycleService.getFeatureLifecycle(featureName);

    expect(lifecycle).toEqual([
        { stage: 'initial', enteredStageAt: expect.any(Date) },
        { stage: 'pre-live', enteredStageAt: expect.any(Date) },
        { stage: 'live', enteredStageAt: expect.any(Date) },
        { stage: 'completed', enteredStageAt: expect.any(Date) },
        { stage: 'archived', enteredStageAt: expect.any(Date) },
    ]);
});

test('ignores lifecycle state updates when flag disabled', async () => {
    const eventBus = new EventEmitter();
    const { featureLifecycleService, eventStore, environmentStore } =
        createFakeFeatureLifecycleService({
            flagResolver: { isEnabled: () => false },
            eventBus,
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
        featureName,
        environment: 'development',
    });
    await eventStore.emit(FEATURE_ARCHIVED, { featureName });

    const lifecycle =
        await featureLifecycleService.getFeatureLifecycle(featureName);

    expect(lifecycle).toEqual([]);
});
