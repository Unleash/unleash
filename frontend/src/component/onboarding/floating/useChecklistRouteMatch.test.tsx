import type { FC } from 'react';
import { expect, test } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { useChecklistRouteMatch } from './useChecklistRouteMatch.ts';

const Probe: FC<{ projectId: string; feature: string | undefined }> = ({
    projectId,
    feature,
}) => {
    const { onProjectRoute, onSdkTargetRoute } = useChecklistRouteMatch({
        projectId,
        feature,
    });
    return (
        <div>
            <span data-testid='project'>{onProjectRoute ? 'y' : 'n'}</span>
            <span data-testid='sdk-target'>{onSdkTargetRoute ? 'y' : 'n'}</span>
        </div>
    );
};

const renderAt = (
    path: string,
    entry: string,
    props: { projectId: string; feature: string | undefined },
) =>
    render(
        <MemoryRouter initialEntries={[entry]}>
            <Routes>
                <Route path={path} element={<Probe {...props} />} />
            </Routes>
        </MemoryRouter>,
    );

test('matches only exact path segments so `default` does not match `default-team`', () => {
    const { getByTestId } = renderAt(
        '/projects/:projectId',
        '/projects/default-team',
        { projectId: 'default', feature: undefined },
    );

    expect(getByTestId('project')).toHaveTextContent('n');
    expect(getByTestId('sdk-target')).toHaveTextContent('n');
});

test('treats any page in the target project as the SDK dialog target when no feature exists', () => {
    const { getByTestId } = renderAt(
        '/projects/:projectId',
        '/projects/default',
        { projectId: 'default', feature: undefined },
    );

    expect(getByTestId('project')).toHaveTextContent('y');
    expect(getByTestId('sdk-target')).toHaveTextContent('y');
});

test('opens the SDK dialog only on the matching feature page when a feature is known', () => {
    const { getByTestId } = renderAt(
        '/projects/:projectId/features/:featureId',
        '/projects/default/features/other-flag',
        { projectId: 'default', feature: 'my-flag' },
    );

    expect(getByTestId('project')).toHaveTextContent('y');
    expect(getByTestId('sdk-target')).toHaveTextContent('n');
});
