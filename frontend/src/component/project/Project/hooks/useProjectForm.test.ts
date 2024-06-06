import { renderHook } from '@testing-library/react';
import useProjectForm from './useProjectForm';
import { act } from 'react-test-renderer';
import { test } from 'vitest';

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
    test.each([
        ['An empty string', ''],
        ['Just whitespace', '     '],
    ])(`%s is not valid`, (_, value) => {
        const { result } = renderHook(() => useProjectForm());

        result.current.setProjectName(value);
        expect(result.current.validateName()).toBeFalsy();
    });
});
