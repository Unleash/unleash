import { createFakeReleaseAgentService } from './createReleaseAgentService.js';
import type { IFlagResolver, IUnleashConfig } from '../../types/index.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { BadDataError, NotFoundError } from '../../error/index.js';
import type { IAuditUser } from '../../types/index.js';

const flagsEnabled: IFlagResolver = {
    getAll: () => ({}),
    isEnabled: (flag: string) => flag === 'releaseAgent',
    getVariant: () => ({ name: 'disabled', enabled: false }) as any,
    getStaticContext: () => ({}) as any,
};

const flagsDisabled: IFlagResolver = {
    ...flagsEnabled,
    isEnabled: () => false,
};

const makeConfig = (flagResolver: IFlagResolver): IUnleashConfig =>
    ({
        getLogger,
        flagResolver,
        eventBus: { emit: () => undefined } as any,
    }) as unknown as IUnleashConfig;

const audit: IAuditUser = { id: 7, username: 'tester', ip: '::1' };

describe('ReleaseAgentService', () => {
    test('creates a sequence with actions and returns them', async () => {
        const { releaseAgentService, scheduledActionStore } =
            createFakeReleaseAgentService(makeConfig(flagsEnabled));

        const result = await releaseAgentService.createSequence(
            {
                project: 'default',
                environment: 'production',
                prompt: 'roll this out',
                model: 'claude',
                agentVersion: 'v1',
                actions: [
                    {
                        featureName: 'flag-a',
                        fireAt: new Date('2026-04-22T09:00:00Z'),
                        actionType: 'feature_environment.setEnabled',
                        payload: { enabled: true },
                    } as any,
                    {
                        featureName: 'flag-a',
                        fireAt: new Date('2026-04-22T09:05:00Z'),
                        actionType: 'strategy.create',
                        payload: {
                            strategyName: 'flexibleRollout',
                            parameters: { rollout: '10' },
                        },
                    } as any,
                ],
            },
            audit,
        );

        expect(result.sequence.id).toBeDefined();
        expect(result.sequence.status).toBe('active');
        expect(result.actions).toHaveLength(2);
        expect(result.actions[0].sortOrder).toBe(0);
        expect(result.actions[1].sortOrder).toBe(1);
        expect(result.actions.every((a) => a.status === 'pending')).toBe(true);

        const all = await scheduledActionStore.getAll();
        expect(all).toHaveLength(2);
    });

    test('rejects empty action lists', async () => {
        const { releaseAgentService } = createFakeReleaseAgentService(
            makeConfig(flagsEnabled),
        );
        await expect(
            releaseAgentService.createSequence(
                {
                    project: 'default',
                    environment: 'production',
                    actions: [],
                },
                audit,
            ),
        ).rejects.toBeInstanceOf(BadDataError);
    });

    test('throws NotFound when flag is disabled', async () => {
        const { releaseAgentService } = createFakeReleaseAgentService(
            makeConfig(flagsDisabled),
        );
        await expect(
            releaseAgentService.createSequence(
                {
                    project: 'default',
                    environment: 'production',
                    actions: [
                        {
                            featureName: 'flag-a',
                            fireAt: new Date(),
                            actionType: 'feature_environment.setEnabled',
                            payload: { enabled: true },
                        } as any,
                    ],
                },
                audit,
            ),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    test('cancelSequence marks pending actions skipped and sequence cancelled', async () => {
        const { releaseAgentService, scheduledActionStore } =
            createFakeReleaseAgentService(makeConfig(flagsEnabled));

        const { sequence } = await releaseAgentService.createSequence(
            {
                project: 'p',
                environment: 'e',
                actions: [
                    {
                        featureName: 'flag-a',
                        fireAt: new Date('2026-04-22T09:00:00Z'),
                        actionType: 'feature_environment.setEnabled',
                        payload: { enabled: true },
                    } as any,
                    {
                        featureName: 'flag-a',
                        fireAt: new Date('2026-04-22T10:00:00Z'),
                        actionType: 'feature_environment.setEnabled',
                        payload: { enabled: false },
                    } as any,
                ],
            },
            audit,
        );

        const cancelled = await releaseAgentService.cancelSequence(sequence.id);
        expect(cancelled.status).toBe('cancelled');

        const actions = await scheduledActionStore.getBySequenceId(sequence.id);
        expect(actions.every((a) => a.status === 'skipped')).toBe(true);
    });

    test('cancelling a non-active sequence throws BadDataError', async () => {
        const { releaseAgentService } = createFakeReleaseAgentService(
            makeConfig(flagsEnabled),
        );
        const { sequence } = await releaseAgentService.createSequence(
            {
                project: 'p',
                environment: 'e',
                actions: [
                    {
                        featureName: 'flag-a',
                        fireAt: new Date('2026-04-22T09:00:00Z'),
                        actionType: 'feature_environment.setEnabled',
                        payload: { enabled: true },
                    } as any,
                ],
            },
            audit,
        );
        await releaseAgentService.cancelSequence(sequence.id);
        await expect(
            releaseAgentService.cancelSequence(sequence.id),
        ).rejects.toBeInstanceOf(BadDataError);
    });

    test('listSequences filters by project+environment', async () => {
        const { releaseAgentService } = createFakeReleaseAgentService(
            makeConfig(flagsEnabled),
        );
        for (const [project, env] of [
            ['p1', 'dev'],
            ['p1', 'prod'],
            ['p2', 'dev'],
        ]) {
            await releaseAgentService.createSequence(
                {
                    project,
                    environment: env,
                    actions: [
                        {
                            featureName: 'flag-a',
                            fireAt: new Date('2026-04-22T09:00:00Z'),
                            actionType: 'feature_environment.setEnabled',
                            payload: { enabled: true },
                        } as any,
                    ],
                },
                audit,
            );
        }

        const list = await releaseAgentService.listSequences('p1', 'dev');
        expect(list).toHaveLength(1);
        expect(list[0].project).toBe('p1');
        expect(list[0].environment).toBe('dev');
    });
});
