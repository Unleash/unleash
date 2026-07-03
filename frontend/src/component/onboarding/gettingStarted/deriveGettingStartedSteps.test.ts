import { describe, expect, test } from 'vitest';
import type { ProjectListItem } from 'hooks/api/getters/useProjects/useProjects';
import { deriveGettingStartedSteps } from './deriveGettingStartedSteps.ts';

const project = (overrides: Partial<ProjectListItem> = {}): ProjectListItem =>
    ({
        id: 'default',
        name: 'Default',
        ...overrides,
    }) as ProjectListItem;

const derive = (
    projects: ProjectListItem[],
    options: {
        hasActiveInviteToken?: boolean;
        manualSteps?: ('add-strategy' | 'invite-teammate')[];
    } = {},
) =>
    deriveGettingStartedSteps({
        projects,
        hasActiveInviteToken: options.hasActiveInviteToken ?? false,
        manualSteps: options.manualSteps ?? [],
    });

const completedIds = (steps: ReturnType<typeof derive>) =>
    steps.filter((step) => step.completed).map((step) => step.id);

describe('deriveGettingStartedSteps', () => {
    test('no projects means nothing is completed', () => {
        expect(completedIds(derive([]))).toEqual([]);
    });

    test('first-flag-created status completes the create flag step', () => {
        const steps = derive([
            project({
                onboardingStatus: {
                    status: 'first-flag-created',
                    feature: 'my-flag',
                },
            }),
        ]);
        expect(completedIds(steps)).toEqual(['create-flag']);
    });

    test('a project with flags completes the create flag step even without onboarding status', () => {
        const steps = derive([project({ featureCount: 3 })]);
        expect(completedIds(steps)).toEqual(['create-flag']);
    });

    test('sdk-connected status completes create flag and connect SDK steps', () => {
        const steps = derive([
            project({
                onboardingStatus: { status: 'sdk-connected' },
            }),
        ]);
        expect(completedIds(steps)).toEqual(['create-flag', 'connect-sdk']);
    });

    test('onboarded status completes create flag, enable flag and connect SDK steps', () => {
        const steps = derive([
            project({ onboardingStatus: { status: 'onboarded' } as const }),
        ]);
        expect(completedIds(steps)).toEqual([
            'create-flag',
            'enable-flag',
            'connect-sdk',
        ]);
    });

    test('more than one project member completes the invite teammate step', () => {
        const steps = derive([project({ memberCount: 2 })]);
        expect(completedIds(steps)).toContain('invite-teammate');
    });

    test('an active invite token completes the invite teammate step', () => {
        const steps = derive([project()], { hasActiveInviteToken: true });
        expect(completedIds(steps)).toContain('invite-teammate');
    });

    test('manual markers complete the strategy and invite steps', () => {
        const steps = derive([project()], {
            manualSteps: ['add-strategy', 'invite-teammate'],
        });
        expect(completedIds(steps)).toEqual([
            'add-strategy',
            'invite-teammate',
        ]);
    });

    test('links point at the default project when it exists', () => {
        const steps = derive([
            project({ id: 'other' }),
            project({ id: 'default' }),
        ]);
        expect(steps[0].href).toBe('/projects/default');
    });

    test('links fall back to the first project when there is no default project', () => {
        const steps = derive([project({ id: 'other' })]);
        expect(steps[0].href).toBe('/projects/other');
    });

    test('the invite teammate step links to the invite link admin page', () => {
        const steps = derive([project()]);
        expect(steps.find((step) => step.id === 'invite-teammate')?.href).toBe(
            '/admin/invite-link',
        );
    });
});
