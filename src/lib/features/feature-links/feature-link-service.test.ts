import { createFakeFeatureLinkService } from './createFeatureLinkService.js';
import type { IAuditUser, IUnleashConfig } from '../../types/index.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import {
    BadDataError,
    NotFoundError,
    OperationDeniedError,
} from '../../error/index.js';

test('create, update and delete feature link', async () => {
    const { featureLinkStore, featureLinkService } =
        createFakeFeatureLinkService({
            getLogger,
        } as unknown as IUnleashConfig);

    const link = await featureLinkService.createLink(
        'default',
        {
            featureName: 'feature',
            url: 'complex.example.com',
            title: 'some title',
        },
        {} as IAuditUser,
    );
    expect(link).toMatchObject({
        featureName: 'feature',
        url: 'https://complex.example.com',
        title: 'some title',
        domain: 'example',
    });

    const newLink = await featureLinkService.updateLink(
        { projectId: 'default', linkId: link.id },
        {
            title: 'new title',
            url: 'https://example1.com',
            featureName: 'feature',
        },
        {} as IAuditUser,
    );
    expect(newLink).toMatchObject({
        featureName: 'feature',
        url: 'https://example1.com',
        title: 'new title',
        domain: 'example1',
    });

    await featureLinkService.deleteLink(
        { projectId: 'default', linkId: link.id },
        {} as IAuditUser,
    );
    expect(await featureLinkStore.getAll()).toMatchObject([]);
});

test('cannot delete/update non existent link', async () => {
    const { featureLinkService } = createFakeFeatureLinkService({
        getLogger,
    } as unknown as IUnleashConfig);

    await expect(
        featureLinkService.updateLink(
            { projectId: 'default', linkId: 'nonexistent' },
            {
                title: 'new title',
                url: 'https://example1.com',
                featureName: 'feature',
            },
            {} as IAuditUser,
        ),
    ).rejects.toThrow(NotFoundError);
    await expect(
        featureLinkService.deleteLink(
            { projectId: 'default', linkId: 'nonexistent' },
            {} as IAuditUser,
        ),
    ).rejects.toThrow(NotFoundError);
});

test('cannot create/update invalid link', async () => {
    const { featureLinkService } = createFakeFeatureLinkService({
        getLogger,
    } as unknown as IUnleashConfig);

    await expect(
        featureLinkService.createLink(
            'irrelevant',
            {
                featureName: 'irrelevant',
                url: '%example.com',
                title: 'irrelevant',
            },
            {} as IAuditUser,
        ),
    ).rejects.toThrow(BadDataError);

    await expect(
        featureLinkService.updateLink(
            { projectId: 'irrelevant', linkId: 'irrelevant' },
            {
                title: 'irrelevant',
                url: '%example.com',
                featureName: 'irrelevant',
            },
            {} as IAuditUser,
        ),
    ).rejects.toThrow(BadDataError);
});

test('cannot exceed allowed link count', async () => {
    const { featureLinkService } = createFakeFeatureLinkService({
        getLogger,
    } as unknown as IUnleashConfig);

    for (let i = 0; i < 10; i++) {
        await featureLinkService.createLink(
            'default',
            {
                featureName: 'feature',
                url: 'example.com',
                title: 'some title',
            },
            {} as IAuditUser,
        );
    }

    await expect(
        featureLinkService.createLink(
            'default',
            {
                featureName: 'feature',
                url: 'example.com',
                title: 'some title',
            },
            {} as IAuditUser,
        ),
    ).rejects.toThrow(OperationDeniedError);
});
