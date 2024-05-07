import { renderHook } from '@testing-library/react-hooks';
import useProjectForm from './useProjectForm';

// refer to : https://www.npmjs.com/package/@testing-library/react-hooks

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
