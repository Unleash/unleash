import { describe, expect, test } from 'vitest';
import EventEmitter from 'node:events';
import { createFakeFeatureToggleService } from '../createFeatureToggleService.js';
import type {
    IAuditUser,
    IFlagResolver,
    IUnleashConfig,
} from '../../../types/index.js';
import getLogger from '../../../../test/fixtures/no-logger.js';

const alwaysOffFlagResolver = {
    isEnabled() {
        return false;
    },
} as unknown as IFlagResolver;

describe('FeatureToggleService deleteFeature', () => {
    test('does not emit feature-deleted when deleting an unarchived feature has no effect', async () => {
        const { featureToggleService, featureToggleStore } =
            createFakeFeatureToggleService({
                getLogger,
                flagResolver: alwaysOffFlagResolver,
                eventBus: new EventEmitter(),
            } as unknown as IUnleashConfig);

        const originalDelete =
            featureToggleStore.delete.bind(featureToggleStore);
        featureToggleStore.delete = async (featureName: string) => {
            const feature = await featureToggleStore.get(featureName);
            if (feature?.archived) {
                await originalDelete(featureName);
            }
        };

        await featureToggleStore.create('default', {
            name: 'unarchived-delete-feature',
            createdByUserId: 1,
        });

        await featureToggleService.deleteFeature(
            'unarchived-delete-feature',
            'default',
            {} as IAuditUser,
        );

        await expect(
            featureToggleStore.get('unarchived-delete-feature'),
        ).resolves.toMatchObject({
            name: 'unarchived-delete-feature',
        });

        const { events } = await (
            featureToggleService as any
        ).eventService.getEvents();

        expect(events.map((event) => event.type)).not.toContain(
            'feature-deleted',
        );
    });

    test('does not emit feature-deleted when batch deleting features has no effect', async () => {
        const { featureToggleService, featureToggleStore } =
            createFakeFeatureToggleService({
                getLogger,
                flagResolver: alwaysOffFlagResolver,
                eventBus: new EventEmitter(),
            } as unknown as IUnleashConfig);

        featureToggleStore.batchDelete = async () => [];

        await featureToggleStore.create('default', {
            name: 'archived-delete-feature',
            archived: true,
            createdByUserId: 1,
        });

        await featureToggleService.deleteFeatures(
            ['archived-delete-feature'],
            'default',
            {} as IAuditUser,
        );

        await expect(
            featureToggleStore.get('archived-delete-feature'),
        ).resolves.toMatchObject({
            name: 'archived-delete-feature',
        });

        const { events } = await (
            featureToggleService as any
        ).eventService.getEvents();

        expect(events.map((event) => event.type)).not.toContain(
            'feature-deleted',
        );
    });
});
