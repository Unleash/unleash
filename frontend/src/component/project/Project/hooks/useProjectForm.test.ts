import { renderHook } from '@testing-library/react';
import useProjectForm from './useProjectForm.js';
import { beforeEach, test, vi } from 'vitest';
import { act } from 'react';

const mockUseProjects = vi.hoisted(() => vi.fn());

vi.mock('hooks/api/getters/useProjects/useProjects.js', () => ({
    default: mockUseProjects,
}));

const createProjectsResponse = (
    projects: Array<{ id: string; name: string }> = [],
) => ({
    projects,
    error: undefined,
    loading: false,
    refetch: vi.fn(),
});

beforeEach(() => {
    mockUseProjects.mockReset();
    mockUseProjects.mockReturnValue(createProjectsResponse());
});

describe('configuring change requests', () => {
    test('setting project environments removes any change request envs that are not in the new project env list', () => {
        const { result } = renderHook(() => useProjectForm());

        act(() => {
            result.current.setProjectEnvironments(new Set(['dev', 'prod']));

            result.current.updateProjectChangeRequestConfig.enableChangeRequests(
                'prod',
                5,
            );
        });

        expect(result.current.projectChangeRequestConfiguration).toMatchObject({
            prod: { requiredApprovals: 5 },
        });

        act(() => {
            result.current.setProjectEnvironments(new Set(['dev']));
        });

        expect(
            'prod' in result.current.projectChangeRequestConfiguration,
        ).toBeFalsy();
    });

    test('setting project environments to an empty set preserves change request configuration', () => {
        const { result } = renderHook(() => useProjectForm());

        result.current.setProjectEnvironments(new Set(['dev', 'prod']));
        result.current.updateProjectChangeRequestConfig.enableChangeRequests(
            'prod',
            5,
        );

        act(() => {
            result.current.setProjectEnvironments(new Set([]));
        });

        expect(result.current.projectChangeRequestConfiguration).toMatchObject({
            prod: { requiredApprovals: 5 },
        });
    });

    test(`if specific project envs are selected, adding a change request config for an env not in the project envs doesn't work and the change request envs is not changed`, () => {
        const { result } = renderHook(() => useProjectForm());

        result.current.setProjectEnvironments(new Set(['prod']));

        result.current.updateProjectChangeRequestConfig.enableChangeRequests(
            'dev',
            5,
        );

        expect(
            'dev' in result.current.projectChangeRequestConfiguration,
        ).toBeFalsy();
    });

    test(`if no project envs are selected, you can add a change request for any env you want`, () => {
        const { result } = renderHook(() => useProjectForm());

        act(() => {
            result.current.updateProjectChangeRequestConfig.enableChangeRequests(
                'dev',
                5,
            );
        });

        expect(
            'dev' in result.current.projectChangeRequestConfiguration,
        ).toBeTruthy();
    });
});

describe('payload generation', () => {
    test(`id is omitted only when explicitly asked to be`, () => {
        const { result } = renderHook(() => useProjectForm());

        const payloadWithId = result.current.getCreateProjectPayload();
        expect('id' in payloadWithId).toBeTruthy();

        const payloadWithoutId = result.current.getCreateProjectPayload({
            omitId: true,
        });
        expect('id' in payloadWithoutId).toBeFalsy();
    });
});

describe('name validation', () => {
    const existingProjects = [
        { id: 'project1', name: 'Project One' },
        { id: 'project2', name: 'Project Two' },
    ];

    test.each([
        ['An empty string', ''],
        ['Just whitespace', '     '],
    ])(`%s is not valid`, (_, value) => {
        const { result } = renderHook(() => useProjectForm());

        act(() => {
            result.current.setProjectName(value);
        });

        let isValid = true;
        act(() => {
            isValid = result.current.validateName();
        });

        expect(isValid).toBeFalsy();
    });

    test('accepts a unique project name on creation', () => {
        mockUseProjects.mockReturnValue(
            createProjectsResponse(existingProjects),
        );

        const { result } = renderHook(() => useProjectForm());

        act(() => {
            result.current.setProjectName('Brand New Project');
        });

        let isValid = false;
        act(() => {
            isValid = result.current.validateName();
        });

        expect(isValid).toBeTruthy();
        expect(result.current.errors).not.toHaveProperty('name');
    });

    test('rejects duplicate project name on creation', () => {
        mockUseProjects.mockReturnValue(
            createProjectsResponse(existingProjects),
        );

        const { result } = renderHook(() => useProjectForm());

        act(() => {
            result.current.setProjectName('Project One');
        });

        let isValid = true;
        act(() => {
            isValid = result.current.validateName();
        });

        expect(isValid).toBeFalsy();
        expect(result.current.errors).toHaveProperty(
            'name',
            'This name is already taken by a different project.',
        );
    });

    test('allows keeping the original name when editing', () => {
        mockUseProjects.mockReturnValue(
            createProjectsResponse(existingProjects),
        );

        const { result } = renderHook(() =>
            useProjectForm('project1', 'Project One'),
        );

        let isValid = false;
        act(() => {
            isValid = result.current.validateName();
        });

        expect(isValid).toBeTruthy();
        expect(result.current.errors).not.toHaveProperty('name');
    });

    test('rejects renaming to another existing project name', () => {
        mockUseProjects.mockReturnValue(
            createProjectsResponse(existingProjects),
        );

        const { result } = renderHook(() =>
            useProjectForm('project1', 'Project One'),
        );

        act(() => {
            result.current.setProjectName('Project Two');
        });

        let isValid = true;
        act(() => {
            isValid = result.current.validateName();
        });

        expect(isValid).toBeFalsy();
        expect(result.current.errors).toHaveProperty(
            'name',
            'This name is already taken by a different project.',
        );
    });

    test('accepts renaming to a new unique project name', () => {
        mockUseProjects.mockReturnValue(
            createProjectsResponse(existingProjects),
        );

        const { result } = renderHook(() =>
            useProjectForm('project1', 'Project One'),
        );

        act(() => {
            result.current.setProjectName('Project Three');
        });

        let isValid = false;
        act(() => {
            isValid = result.current.validateName();
        });

        expect(isValid).toBeTruthy();
        expect(result.current.errors).not.toHaveProperty('name');
    });
});
