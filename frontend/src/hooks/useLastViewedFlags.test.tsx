import type React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useLastViewedFlags } from './useLastViewedFlags.ts';

const TestComponent: React.FC<{
    testId: string;
    featureId: string;
    projectId: string;
}> = ({ testId, featureId, projectId }) => {
    const { lastViewed, setLastViewed } = useLastViewedFlags();

    const handleUpdate = () => {
        setLastViewed({ featureId, projectId });
    };

    return (
        <div>
            <div data-testid={testId}>
                {lastViewed.map((flag, index) => (
                    <div
                        key={index}
                    >{`${flag.featureId} - ${flag.projectId}`}</div>
                ))}
            </div>
            <button
                type='button'
                onClick={handleUpdate}
                data-testid={`update-${testId}`}
            >
                Add {featureId} {projectId}
            </button>
        </div>
    );
};

describe('Last three unique flags are persisted and duplicates are skipped', () => {
    beforeEach(() => {
        localStorage.clear();
        render(
            <>
                <TestComponent
                    testId='component1'
                    featureId='Feature1'
                    projectId='Project1'
                />
                <TestComponent
                    testId='component2'
                    featureId='Feature2'
                    projectId='Project2'
                />
                <TestComponent
                    testId='component3'
                    featureId='Feature3'
                    projectId='Project3'
                />
                <TestComponent
                    testId='component4'
                    featureId='Feature4'
                    projectId='Project4'
                />
            </>,
        );
    });

    it('only persists the last three unique flags across components and skips duplicates', async () => {
        fireEvent.click(screen.getByTestId('update-component1'));
        fireEvent.click(screen.getByTestId('update-component2'));
        fireEvent.click(screen.getByTestId('update-component1')); // duplicate
        fireEvent.click(screen.getByTestId('update-component3'));
        fireEvent.click(screen.getByTestId('update-component4'));

        expect(await screen.findAllByText('Feature2 - Project2')).toHaveLength(
            4,
        );
        expect(await screen.findAllByText('Feature3 - Project3')).toHaveLength(
            4,
        );
        expect(await screen.findAllByText('Feature4 - Project4')).toHaveLength(
            4,
        );
    });
});
