import { describe, expect, test, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { testServerSetup } from 'utils/testServer';
import { ADMIN } from 'component/providers/AccessProvider/permissions.ts';
import { FloatingOnboardingChecklistVisibilityGate } from './FloatingOnboardingChecklistVisibilityGate.tsx';
import {
    ONBOARDING_CHECKLIST_ELIGIBILITY_DECIDED_SPLASH_ID,
    ONBOARDING_CHECKLIST_ELIGIBLE_SPLASH_ID,
} from './useOnboardingChecklistVisibility.ts';

vi.mock('./FloatingOnboardingChecklist.tsx', () => ({
    FloatingOnboardingChecklist: () => <div>CHECKLIST</div>,
}));

const server = testServerSetup();

type ProjectStatus = 'onboarding-started' | 'onboarded';
type ProjectSpec = ProjectStatus | { id: string; status: ProjectStatus };

type Edition = 'oss' | 'enterprise';

const setupMocks = ({
    edition = 'enterprise' as Edition,
    initialSplash = {} as Record<string, boolean>,
    flagEnabled = true,
    projects = [] as ProjectSpec[],
    projectsFail = false,
    defaultStatus = 'onboarding-started' as ProjectStatus | 'missing' | 'error',
} = {}) => {
    const splash: Record<string, boolean> = { ...initialSplash };
    const state = { projectsFetches: 0, overviewFetches: 0 };
    const postedKeys: string[] = [];

    const normalized = projects.map((p, i) =>
        typeof p === 'string'
            ? { id: i === 0 ? 'default' : `p${i}`, status: p }
            : p,
    );

    server.use(
        http.get('*/api/admin/ui-config', () =>
            HttpResponse.json({
                flags: { floatingOnboardingChecklist: flagEnabled },
                versionInfo:
                    edition === 'enterprise'
                        ? { current: { enterprise: '5.0.0' } }
                        : { current: {} },
            }),
        ),
        http.get('*/api/admin/user', () =>
            HttpResponse.json({
                user: { id: 1 },
                permissions: [],
                feedback: [],
                splash: { ...splash },
            }),
        ),
        http.get('*/api/admin/projects', () => {
            state.projectsFetches += 1;
            if (projectsFail) {
                return new HttpResponse(null, { status: 500 });
            }
            return HttpResponse.json({
                projects: normalized.map(({ id, status }) => ({
                    id,
                    name: id,
                    onboardingStatus: { status },
                })),
            });
        }),
        http.get('*/api/admin/projects/default/overview', () => {
            state.overviewFetches += 1;
            if (defaultStatus === 'missing') {
                return new HttpResponse(null, { status: 404 });
            }
            if (defaultStatus === 'error') {
                return new HttpResponse(null, { status: 500 });
            }
            return HttpResponse.json({
                name: 'default',
                onboardingStatus: { status: defaultStatus },
            });
        }),
        http.post('*/api/admin/splash/:id', ({ params }) => {
            const key = params.id as string;
            postedKeys.push(key);
            splash[key] = true;
            return HttpResponse.json({});
        }),
    );

    return { state, postedKeys };
};

const adminOpts = { permissions: [{ permission: ADMIN }] };

describe('visibility gate', () => {
    test('stays hidden when the checklist feature is disabled', async () => {
        const mocks = setupMocks({
            flagEnabled: false,
            projects: ['onboarding-started'],
            defaultStatus: 'onboarding-started',
        });

        const { container } = render(
            <FloatingOnboardingChecklistVisibilityGate />,
            adminOpts,
        );

        await waitFor(() => {
            expect(container.textContent).toBe('');
        });
        expect(mocks.state.projectsFetches).toBe(0);
        expect(mocks.state.overviewFetches).toBe(0);
        expect(mocks.postedKeys).toEqual([]);
    });

    test('shows the checklist immediately when the user is already known to be eligible', async () => {
        const mocks = setupMocks({
            initialSplash: {
                [ONBOARDING_CHECKLIST_ELIGIBILITY_DECIDED_SPLASH_ID]: true,
                [ONBOARDING_CHECKLIST_ELIGIBLE_SPLASH_ID]: true,
            },
            projects: ['onboarded'],
            defaultStatus: 'onboarded',
        });

        render(<FloatingOnboardingChecklistVisibilityGate />, adminOpts);

        expect(await screen.findByText('CHECKLIST')).toBeInTheDocument();
        expect(mocks.state.projectsFetches).toBe(0);
        expect(mocks.state.overviewFetches).toBe(0);
        expect(mocks.postedKeys).toEqual([]);
    });

    test('stays hidden when the user is already known to be not eligible', async () => {
        const mocks = setupMocks({
            initialSplash: {
                [ONBOARDING_CHECKLIST_ELIGIBILITY_DECIDED_SPLASH_ID]: true,
            },
            projects: ['onboarding-started'],
            defaultStatus: 'onboarding-started',
        });

        const { container } = render(
            <FloatingOnboardingChecklistVisibilityGate />,
            adminOpts,
        );

        await waitFor(() => {
            expect(container.textContent).toBe('');
        });
        expect(mocks.state.projectsFetches).toBe(0);
        expect(mocks.state.overviewFetches).toBe(0);
        expect(mocks.postedKeys).toEqual([]);
    });
});

describe('OSS', () => {
    test('records the user as eligible when the default project is still onboarding', async () => {
        const mocks = setupMocks({
            edition: 'oss',
            defaultStatus: 'onboarding-started',
        });

        render(<FloatingOnboardingChecklistVisibilityGate />, adminOpts);

        await waitFor(() => {
            expect(mocks.postedKeys).toEqual(
                expect.arrayContaining([
                    ONBOARDING_CHECKLIST_ELIGIBILITY_DECIDED_SPLASH_ID,
                    ONBOARDING_CHECKLIST_ELIGIBLE_SPLASH_ID,
                ]),
            );
        });
        expect(mocks.state.projectsFetches).toBe(0);
    });

    test('stays hidden when the default project is already onboarded', async () => {
        const mocks = setupMocks({
            edition: 'oss',
            defaultStatus: 'onboarded',
        });

        render(<FloatingOnboardingChecklistVisibilityGate />, adminOpts);

        await waitFor(() => {
            expect(mocks.postedKeys).toContain(
                ONBOARDING_CHECKLIST_ELIGIBILITY_DECIDED_SPLASH_ID,
            );
        });
        expect(mocks.postedKeys).not.toContain(
            ONBOARDING_CHECKLIST_ELIGIBLE_SPLASH_ID,
        );
        expect(mocks.state.projectsFetches).toBe(0);
    });

    test('stays hidden when the default project is missing', async () => {
        const mocks = setupMocks({
            edition: 'oss',
            defaultStatus: 'missing',
        });

        render(<FloatingOnboardingChecklistVisibilityGate />, adminOpts);

        await waitFor(() => {
            expect(mocks.postedKeys).toContain(
                ONBOARDING_CHECKLIST_ELIGIBILITY_DECIDED_SPLASH_ID,
            );
        });
        expect(mocks.postedKeys).not.toContain(
            ONBOARDING_CHECKLIST_ELIGIBLE_SPLASH_ID,
        );
        expect(mocks.state.projectsFetches).toBe(0);
    });

    test('stays hidden without recording a decision when the default project fetch fails', async () => {
        const mocks = setupMocks({
            edition: 'oss',
            defaultStatus: 'error',
        });

        const { container } = render(
            <FloatingOnboardingChecklistVisibilityGate />,
            adminOpts,
        );

        await waitFor(() =>
            expect(mocks.state.overviewFetches).toBeGreaterThan(0),
        );
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(mocks.postedKeys).toEqual([]);
        expect(container.textContent).toBe('');
    });
});

describe('Enterprise', () => {
    test('records the user as eligible when no project has been onboarded', async () => {
        const mocks = setupMocks({
            edition: 'enterprise',
            projects: ['onboarding-started'],
        });

        render(<FloatingOnboardingChecklistVisibilityGate />, adminOpts);

        await waitFor(() => {
            expect(mocks.postedKeys).toEqual(
                expect.arrayContaining([
                    ONBOARDING_CHECKLIST_ELIGIBILITY_DECIDED_SPLASH_ID,
                    ONBOARDING_CHECKLIST_ELIGIBLE_SPLASH_ID,
                ]),
            );
        });
        expect(mocks.state.overviewFetches).toBe(0);
    });

    test('stays hidden when the default project is missing', async () => {
        const mocks = setupMocks({
            edition: 'enterprise',
            projects: [{ id: 'other', status: 'onboarding-started' }],
        });

        const { container } = render(
            <FloatingOnboardingChecklistVisibilityGate />,
            adminOpts,
        );

        await waitFor(() => {
            expect(mocks.postedKeys).toContain(
                ONBOARDING_CHECKLIST_ELIGIBILITY_DECIDED_SPLASH_ID,
            );
        });
        expect(mocks.postedKeys).not.toContain(
            ONBOARDING_CHECKLIST_ELIGIBLE_SPLASH_ID,
        );
        expect(container.textContent).toBe('');
        expect(mocks.state.overviewFetches).toBe(0);
    });

    test('stays hidden when any project has been onboarded', async () => {
        const mocks = setupMocks({
            edition: 'enterprise',
            projects: ['onboarding-started', 'onboarded'],
        });

        const { container } = render(
            <FloatingOnboardingChecklistVisibilityGate />,
            adminOpts,
        );

        await waitFor(() => {
            expect(mocks.postedKeys).toContain(
                ONBOARDING_CHECKLIST_ELIGIBILITY_DECIDED_SPLASH_ID,
            );
        });
        expect(mocks.postedKeys).not.toContain(
            ONBOARDING_CHECKLIST_ELIGIBLE_SPLASH_ID,
        );
        expect(container.textContent).toBe('');
        expect(mocks.state.overviewFetches).toBe(0);
    });

    test('stays hidden without recording a decision when the projects fetch fails', async () => {
        const mocks = setupMocks({
            edition: 'enterprise',
            projectsFail: true,
        });

        const { container } = render(
            <FloatingOnboardingChecklistVisibilityGate />,
            adminOpts,
        );

        await waitFor(() =>
            expect(mocks.state.projectsFetches).toBeGreaterThan(0),
        );
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(mocks.postedKeys).toEqual([]);
        expect(container.textContent).toBe('');
        expect(mocks.state.overviewFetches).toBe(0);
    });
});
