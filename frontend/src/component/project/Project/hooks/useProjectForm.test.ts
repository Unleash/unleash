import { renderHook } from '@testing-library/react-hooks';
import useProjectForm from './useProjectForm';
import { vi } from 'vitest';

test('setting project environments removes any change request envs that are not in the new project env list', () => {
    const { result } = renderHook(() => useProjectForm());

    result.current.setProjectEnvironments(new Set(['dev', 'prod']));
    result.current.updateProjectChangeRequestConfig.enableChangeRequests(
        'prod',
        5,
    );

    expect(result.current.projectChangeRequestConfiguration).toMatchObject({
        prod: { requiredApprovals: 5 },
    });

    result.current.setProjectEnvironments(new Set(['dev']));

    expect(
        'prod' in result.current.projectChangeRequestConfiguration,
    ).toBeFalsy();
});

test(`adding a change request config for an env not in the project envs doesn't work and the change request envs is not changed`, () => {
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

describe('payload generation', () => {
    test(`change request env info is not included unless asked for specifically`, () => {
        vi.mock(
            'hooks/api/getters/useUiConfig/useUiConfig',
            async (importOriginal) => {
                const actual = await importOriginal();
                return {
                    //@ts-ignore
                    ...actual,
                    useUiConfig: () => ({
                        isEnterprise: () => true,
                    }),
                };
            },
        );

        const { result } = renderHook(() => useProjectForm());

        const payloadWithoutCrs = result.current.getCreateProjectPayload();
        expect('changeRequestEnvironments' in payloadWithoutCrs).toBeFalsy();

        const payloadWithCrs = result.current.getCreateProjectPayload({
            includeChangeRequestConfig: true,
        });
        expect('changeRequestEnvironments' in payloadWithCrs).toBeTruthy();
    });

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
