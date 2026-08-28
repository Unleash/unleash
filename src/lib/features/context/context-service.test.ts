import { createTestConfig } from '../../../test/config/test-config.js';
import { TEST_AUDIT_USER } from '../../types/index.js';
import { NotFoundError } from '../../error/index.js';
import { createFakeContextService } from './createContextService.js';

const { contextService } = createFakeContextService(createTestConfig());

test('a context field cannot be mutated through a project that does not own it', async () => {
    await contextService.createContextField(
        { name: 'ownedField', project: 'owner-project' },
        TEST_AUDIT_USER,
    );
    const otherProject = 'other-project';

    await expect(
        contextService.updateContextField(
            { name: 'ownedField', description: 'hijacked' },
            TEST_AUDIT_USER,
            otherProject,
        ),
    ).rejects.toThrow(NotFoundError);
    await expect(
        contextService.updateLegalValue(
            { name: 'ownedField', legalValue: { value: 'hijacked' } },
            TEST_AUDIT_USER,
            otherProject,
        ),
    ).rejects.toThrow(NotFoundError);
    await expect(
        contextService.deleteLegalValue(
            { name: 'ownedField', legalValue: 'hijacked' },
            TEST_AUDIT_USER,
            otherProject,
        ),
    ).rejects.toThrow(NotFoundError);
    await expect(
        contextService.deleteContextField(
            'ownedField',
            TEST_AUDIT_USER,
            otherProject,
        ),
    ).rejects.toThrow(NotFoundError);
});

test('deleting a context field that does not exist reports not found and records no deletion event', async () => {
    const { contextService, eventService } = createFakeContextService(
        createTestConfig(),
    );

    await expect(
        contextService.deleteContextField('nonExistent', TEST_AUDIT_USER),
    ).rejects.toThrow(NotFoundError);

    const { events } = await eventService.getEvents();
    expect(events).toEqual([]);
});

test('a project can only mutate its own context fields, not global ones', async () => {
    await contextService.createContextField(
        { name: 'globalField' },
        TEST_AUDIT_USER,
    );

    await expect(
        contextService.updateContextField(
            { name: 'globalField', description: 'hijacked' },
            TEST_AUDIT_USER,
            'any-project',
        ),
    ).rejects.toThrow(NotFoundError);
});
