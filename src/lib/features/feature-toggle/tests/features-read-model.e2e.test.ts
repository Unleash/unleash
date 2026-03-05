import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../../test/fixtures/no-logger.js';
import { FeaturesReadModel } from '../features-read-model.js';

test('features read model', async () => {
    const db = await dbInit('features_read_model_serial', getLogger);
    const featureToggleStore = db.stores.featureToggleStore;
    const readModel = new FeaturesReadModel(db.rawDatabase);

    await db.stores.projectStore.create({
        id: 'other-project',
        name: 'Other Project',
        description: 'Other Project',
    });

    await featureToggleStore.create('default', {
        name: 'feature-a',
        createdByUserId: 9999,
    });
    await featureToggleStore.create('default', {
        name: 'feature-b',
        createdByUserId: 9999,
    });
    await featureToggleStore.create('other-project', {
        name: 'feature-c',
        createdByUserId: 9999,
    });
    await featureToggleStore.create('default', {
        name: 'archived-feature',
        archived: true,
        createdByUserId: 9999,
    });

    // featureExists
    expect(await readModel.featureExists('feature-a')).toBe(true);
    expect(await readModel.featureExists('no-such-feature')).toBe(false);
    expect(await readModel.featureExists('archived-feature')).toBe(false);

    // featureExistsInProject
    expect(await readModel.featureExistsInProject('feature-a', 'default')).toBe(
        true,
    );
    expect(
        await readModel.featureExistsInProject('feature-a', 'other-project'),
    ).toBe(false);
    expect(
        await readModel.featureExistsInProject('no-such-feature', 'default'),
    ).toBe(false);
    expect(
        await readModel.featureExistsInProject('archived-feature', 'default'),
    ).toBe(false);

    // featuresInTheSameProject
    expect(
        await readModel.featuresInTheSameProject('feature-a', 'feature-b'),
    ).toBe(true);
    expect(
        await readModel.featuresInTheSameProject('feature-a', 'feature-c'),
    ).toBe(false);

    await db.destroy();
});
