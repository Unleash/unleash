import { FakeScheduledActionStore } from '../../../test/fixtures/fake-scheduled-action-store.js';
import { FakeScheduledSequenceStore } from '../../../test/fixtures/fake-scheduled-sequence-store.js';
import type { ScheduledActionWriteModel } from './scheduled-action.js';

const buildAction = (
    overrides: Partial<ScheduledActionWriteModel> = {},
): ScheduledActionWriteModel =>
    ({
        id: overrides.id ?? 'action-1',
        sequenceId: overrides.sequenceId ?? 'seq-1',
        featureName: overrides.featureName ?? 'flag-a',
        fireAt: overrides.fireAt ?? new Date('2026-04-22T10:00:00Z'),
        actionType: overrides.actionType ?? 'feature_environment.setEnabled',
        payload: overrides.payload ?? { enabled: true },
        sortOrder: overrides.sortOrder ?? 0,
    }) as ScheduledActionWriteModel;

describe('FakeScheduledActionStore', () => {
    test('getActionsToFire returns only pending actions past fire_at, ordered', async () => {
        const store = new FakeScheduledActionStore();
        await store.insert(
            buildAction({
                id: 'a',
                fireAt: new Date('2026-04-22T09:00:00Z'),
                sortOrder: 1,
            }),
        );
        await store.insert(
            buildAction({
                id: 'b',
                fireAt: new Date('2026-04-22T08:00:00Z'),
                sortOrder: 2,
            }),
        );
        await store.insert(
            buildAction({
                id: 'c-future',
                fireAt: new Date('2026-04-22T12:00:00Z'),
            }),
        );

        const due = await store.getActionsToFire(
            new Date('2026-04-22T10:00:00Z'),
        );

        expect(due.map((d) => d.id)).toEqual(['b', 'a']);
    });

    test('does not return executed, failed, or skipped actions', async () => {
        const store = new FakeScheduledActionStore();
        await store.insert(
            buildAction({
                id: 'a',
                fireAt: new Date('2026-04-22T09:00:00Z'),
            }),
        );
        await store.insert(
            buildAction({
                id: 'b',
                fireAt: new Date('2026-04-22T09:00:00Z'),
            }),
        );
        await store.insert(
            buildAction({
                id: 'c',
                fireAt: new Date('2026-04-22T09:00:00Z'),
            }),
        );

        await store.markExecuted('a', null);
        await store.markFailed('b', 'kaboom');
        await store.markSkipped('c', 'why not');

        const due = await store.getActionsToFire(
            new Date('2026-04-22T10:00:00Z'),
        );
        expect(due).toHaveLength(0);
    });

    test('cancelPendingForSequence marks only that sequence pending actions as skipped', async () => {
        const store = new FakeScheduledActionStore();
        await store.insert(buildAction({ id: 'a', sequenceId: 'seq-1' }));
        await store.insert(buildAction({ id: 'b', sequenceId: 'seq-1' }));
        await store.insert(buildAction({ id: 'c', sequenceId: 'seq-2' }));
        await store.markExecuted('a', null);

        const count = await store.cancelPendingForSequence('seq-1');

        expect(count).toBe(1);
        expect((await store.get('b')).status).toBe('skipped');
        expect((await store.get('a')).status).toBe('executed');
        expect((await store.get('c')).status).toBe('pending');
    });
});

describe('FakeScheduledSequenceStore', () => {
    test('status defaults to active and can be updated', async () => {
        const store = new FakeScheduledSequenceStore();
        const seq = await store.insert({
            id: 'seq-1',
            project: 'p',
            environment: 'e',
            createdByUserId: 1,
            prompt: null,
            model: null,
            agentVersion: null,
        });
        expect(seq.status).toBe('active');

        await store.updateStatus('seq-1', 'cancelled');
        expect((await store.get('seq-1')).status).toBe('cancelled');
    });

    test('getByProjectAndEnvironment filters correctly', async () => {
        const store = new FakeScheduledSequenceStore();
        await store.insert({
            id: 's1',
            project: 'p1',
            environment: 'dev',
            createdByUserId: 1,
            prompt: null,
            model: null,
            agentVersion: null,
        });
        await store.insert({
            id: 's2',
            project: 'p1',
            environment: 'prod',
            createdByUserId: 1,
            prompt: null,
            model: null,
            agentVersion: null,
        });
        await store.insert({
            id: 's3',
            project: 'p2',
            environment: 'dev',
            createdByUserId: 1,
            prompt: null,
            model: null,
            agentVersion: null,
        });

        const result = await store.getByProjectAndEnvironment('p1', 'dev');
        expect(result.map((s) => s.id)).toEqual(['s1']);
    });
});
