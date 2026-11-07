import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { beforeEach, expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import type { ISegment } from 'interfaces/segment';
import {
    UPDATE_PROJECT_SEGMENT,
    UPDATE_SEGMENT,
} from 'component/providers/AccessProvider/permissions';
import { EditSegmentButton } from './EditSegmentButton.tsx';

const server = testServerSetup();

beforeEach(() => {
    testServerRoute(server, '/api/admin/ui-config', { flags: {} });
});

const segment: ISegment = {
    id: 1,
    name: 'Beta users',
    description: '',
    project: 'example-project',
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'admin',
    constraints: [],
};

test.each([
    {
        name: 'project permission from the global list',
        route: '/segments',
        project: 'example-project',
        permissions: [
            {
                permission: UPDATE_PROJECT_SEGMENT,
                project: 'example-project',
            },
        ],
        enabled: true,
    },
    {
        name: 'project permission from the project list',
        route: '/projects/example-project/settings/segments',
        project: 'example-project',
        permissions: [
            {
                permission: UPDATE_PROJECT_SEGMENT,
                project: 'example-project',
            },
        ],
        enabled: true,
    },
    {
        name: 'another project permission from the global list',
        route: '/segments',
        project: 'example-project',
        permissions: [
            { permission: UPDATE_PROJECT_SEGMENT, project: 'other-project' },
        ],
        enabled: false,
    },
    {
        name: 'a route for another project does not grant access',
        route: '/projects/other-project/settings/segments',
        project: 'example-project',
        permissions: [
            { permission: UPDATE_PROJECT_SEGMENT, project: 'other-project' },
        ],
        enabled: false,
    },
    {
        name: 'project permission does not grant access to a global segment',
        route: '/projects/example-project/settings/segments',
        project: undefined,
        permissions: [
            {
                permission: UPDATE_PROJECT_SEGMENT,
                project: 'example-project',
            },
        ],
        enabled: false,
    },
    {
        name: 'root permission grants access to a project segment',
        route: '/segments',
        project: 'example-project',
        permissions: [{ permission: UPDATE_SEGMENT }],
        enabled: true,
    },
    {
        name: 'root permission grants access to a global segment',
        route: '/segments',
        project: undefined,
        permissions: [{ permission: UPDATE_SEGMENT }],
        enabled: true,
    },
])('$name', ({ route, project, permissions, enabled }) => {
    const element = <EditSegmentButton segment={{ ...segment, project }} />;
    render(
        <Routes>
            <Route path='/segments' element={element} />
            <Route
                path='/projects/:projectId/settings/segments'
                element={element}
            />
        </Routes>,
        { route, permissions },
    );

    const button = screen.getByRole('button');
    if (enabled) {
        expect(button).toBeEnabled();
    } else {
        expect(button).toBeDisabled();
    }
});

test('editing from the global list preserves the global edit route', async () => {
    const user = userEvent.setup();
    render(<EditSegmentButton segment={segment} />, {
        route: '/segments',
        permissions: [
            {
                permission: UPDATE_PROJECT_SEGMENT,
                project: 'example-project',
            },
        ],
    });

    await user.click(screen.getByRole('button'));

    expect(window.location.pathname).toBe('/segments/edit/1');
});
