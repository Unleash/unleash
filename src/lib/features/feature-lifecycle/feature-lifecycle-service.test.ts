import { FEATURE_CREATED } from '../../types';
import { createFakeFeatureLifecycleService } from './createFeatureLifecycle';

test('can insert and read lifecycle stages', async () => {
    const { featureLifecycleService, eventStore } =
        createFakeFeatureLifecycleService();
    featureLifecycleService.listen();

    await eventStore.emit(FEATURE_CREATED, { featureName: 'testFeature' });

    const lifecycle =
        await featureLifecycleService.getFeatureLifecycle('testFeature');

    expect(lifecycle).toEqual([
        { stage: 'initial', enteredStageAt: expect.any(Date) },
    ]);
});
