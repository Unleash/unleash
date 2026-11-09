import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { beforeEach, expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { SEGMENT_SAVE_BTN_ID } from 'utils/testIds';
import type { ISegment } from 'interfaces/segment';
import type { IPermission } from 'interfaces/user';
import {
    UPDATE_PROJECT_SEGMENT,
    UPDATE_SEGMENT,
} from 'component/providers/AccessProvider/permissions';
import { EditSegment } from './EditSegment.tsx';

const server = testServerSetup();
const segment: ISegment = {
    id: 1,
    name: 'Beta users',
    description: '',
    project: 'example-project',
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'admin',
    constraints: [],
};
const projectPermissions = [
    { permission: UPDATE_PROJECT_SEGMENT, project: 'example-project' },
];

beforeEach(() => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {},
        resourceLimits: {
            segments: 300,
            segmentValues: 1000,
            strategySegments: 5,
        },
    });
    testServerRoute(server, '/api/admin/projects', {
        projects: [
            { id: 'example-project', name: 'Example project' },
            { id: 'other-project', name: 'Other project' },
        ],
    });
    testServerRoute(server, '/api/admin/segments', { segments: [segment] });
    testServerRoute(server, '/api/admin/segments/1', segment);
    testServerRoute(server, '/api/admin/segments/1/strategies', {
        strategies: [],
        changeRequestStrategies: [],
    });
    testServerRoute(server, '/api/admin/context', []);
    testServerRoute(server, '/api/admin/projects/example-project/context', []);
    testServerRoute(server, '/api/admin/projects/other-project/context', []);
});

const renderEditor = (permissions: IPermission[], route = '/segments/edit/1') =>
    render(
        <Routes>
            <Route path='/segments/edit/:segmentId' element={<EditSegment />} />
            <Route
                path='/projects/:projectId/settings/segments/edit/:segmentId'
                element={<EditSegment />}
            />
            <Route path='/segments/' element={<div>Segments</div>} />
        </Routes>,
        { route, permissions },
    );

const goToConstraints = async () => {
    const user = userEvent.setup();
    await screen.findByDisplayValue(segment.name);
    const next = screen.getByRole('button', { name: 'Next' });
    await waitFor(() => expect(next).toBeEnabled());
    await user.click(next);
    return screen.findByTestId(SEGMENT_SAVE_BTN_ID);
};

test.each([
    '/segments/edit/1',
    '/projects/example-project/settings/segments/edit/1',
])('project permission enables Save at %s', async (route) => {
    renderEditor(projectPermissions, route);

    expect(await goToConstraints()).not.toHaveAttribute(
        'aria-disabled',
        'true',
    );
});

test('project permission can save from a global deep link', async () => {
    const user = userEvent.setup();
    const { requests } = testServerRoute(
        server,
        '/api/admin/segments/1',
        null,
        'put',
        204,
    );
    renderEditor(projectPermissions);

    await user.click(await goToConstraints());

    await waitFor(() => {
        expect(requests).toEqual([
            expect.objectContaining({
                name: segment.name,
                project: 'example-project',
                constraints: [],
            }),
        ]);
    });
    await waitFor(() => expect(window.location.pathname).toBe('/segments/'));
});

test('another project permission does not enable Save', async () => {
    renderEditor([
        { permission: UPDATE_PROJECT_SEGMENT, project: 'other-project' },
    ]);

    expect(await goToConstraints()).toHaveAttribute('aria-disabled', 'true');
});

test('a project route does not grant access to a global segment', async () => {
    testServerRoute(server, '/api/admin/segments/1', {
        ...segment,
        project: undefined,
    });
    renderEditor(
        projectPermissions,
        '/projects/example-project/settings/segments/edit/1',
    );

    expect(await goToConstraints()).toHaveAttribute('aria-disabled', 'true');
});

test('project-only editors cannot change project assignment', async () => {
    renderEditor(projectPermissions);

    expect(
        await screen.findByRole('combobox', { name: 'Project' }),
    ).toBeDisabled();
});

test('root editors can still change project assignment and save', async () => {
    renderEditor([{ permission: UPDATE_SEGMENT }]);

    expect(
        await screen.findByRole('combobox', { name: 'Project' }),
    ).toBeEnabled();
    expect(await goToConstraints()).not.toHaveAttribute(
        'aria-disabled',
        'true',
    );
});
