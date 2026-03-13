import { describe, expect, test, vi } from 'vitest';
import type { IEventStore, IFlagResolver } from '../../../types/index.js';
import ConfigurationRevisionService from '../configuration-revision-service.js';
import noLoggerProvider from '../../../../test/fixtures/no-logger.js';

const enabledFlagResolver = {
    isEnabled: () => false,
} as unknown as IFlagResolver;

const createService = ({
    maxRevisionId = 100,
    deltaRevisionState = {
        projectRevisions: new Map<string, number>(),
        globalSegmentRevision: 0,
    },
}: {
    maxRevisionId?: number;
    deltaRevisionState?: {
        projectRevisions: Map<string, number>;
        globalSegmentRevision: number;
    };
} = {}) => {
    const eventStore = {
        getMaxRevisionId: vi.fn().mockResolvedValue(maxRevisionId),
        getDeltaRevisionState: vi.fn().mockResolvedValue(deltaRevisionState),
    } as unknown as IEventStore;

    const configurationRevisionService =
        ConfigurationRevisionService.getInstance(
            { eventStore },
            {
                getLogger: noLoggerProvider,
                flagResolver: enabledFlagResolver,
            },
        );

    return { configurationRevisionService, eventStore };
};

describe('ConfigurationRevisionService', () => {
    test('returns global max revision for wildcard projects', async () => {
        const { configurationRevisionService, eventStore } = createService({
            maxRevisionId: 91,
        });

        const revisionId =
            await configurationRevisionService.getVisibleRevisionId(
                'development',
                ['*'],
            );

        expect(revisionId).toBe(91);
        expect(eventStore.getDeltaRevisionState).not.toHaveBeenCalled();
        configurationRevisionService.destroy();
    });

    test('returns max of project and segment revisions for project scoped tokens', async () => {
        const { configurationRevisionService, eventStore } = createService({
            maxRevisionId: 120,
            deltaRevisionState: {
                projectRevisions: new Map([
                    ['alpha', 16],
                    ['beta', 22],
                ]),
                globalSegmentRevision: 18,
            },
        });

        const revisionId =
            await configurationRevisionService.getVisibleRevisionId(
                'development',
                ['alpha', 'beta'],
            );

        expect(revisionId).toBe(22);
        expect(eventStore.getDeltaRevisionState).toHaveBeenCalledWith(
            'development',
            120,
        );
        configurationRevisionService.destroy();
    });

    test('falls back to wildcard semantics for empty project list', async () => {
        const { configurationRevisionService, eventStore } = createService({
            maxRevisionId: 77,
        });

        const revisionId =
            await configurationRevisionService.getVisibleRevisionId(
                'production',
                [],
            );

        expect(revisionId).toBe(77);
        expect(eventStore.getDeltaRevisionState).not.toHaveBeenCalled();
        configurationRevisionService.destroy();
    });
});
