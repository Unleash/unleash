import type React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useLastViewedProject } from './useLastViewedProject.ts';

const TestComponent: React.FC<{ testId: string; buttonLabel: string }> = ({
    testId,
    buttonLabel,
}) => {
    const { lastViewed, setLastViewed } = useLastViewedProject();

    return (
        <div>
            <span data-testid={testId}>{lastViewed}</span>
            <button
                type='button'
                onClick={() => setLastViewed(`${buttonLabel} Project`)}
                data-testid={`update-${testId}`}
            >
                Update to {buttonLabel} Project
            </button>
        </div>
    );
};

describe('Synchronization between multiple components using useLastViewedProject', () => {
    beforeEach(() => {
        localStorage.clear();
        render(
            <>
                <TestComponent testId='component1' buttonLabel='First' />
                <TestComponent testId='component2' buttonLabel='Second' />
            </>,
        );
    });

    it('updates both components when one updates its last viewed project', async () => {
        expect(screen.getByTestId('component1').textContent).toBe('');
        expect(screen.getByTestId('component2').textContent).toBe('');

        fireEvent.click(screen.getByTestId('update-component1'));

        expect(await screen.findByTestId('component1')).toHaveTextContent(
            'First Project',
        );
        expect(await screen.findByTestId('component2')).toHaveTextContent(
            'First Project',
        );

        fireEvent.click(screen.getByTestId('update-component2'));

        expect(await screen.findByTestId('component1')).toHaveTextContent(
            'Second Project',
        );
        expect(await screen.findByTestId('component2')).toHaveTextContent(
            'Second Project',
        );
    });
});
