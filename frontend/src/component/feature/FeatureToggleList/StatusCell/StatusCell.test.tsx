import { render } from 'utils/testRenderer';
import { StatusCell } from './StatusCell.tsx';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

describe('StatusCell', () => {
    it('displays "–" as default status', () => {
        const { getByText } = render(
            <StatusCell
                project='test-project'
                lifecycle={{
                    stage: 'live',
                    enteredStageAt: '2025-04-01T00:00:00Z',
                }}
                environments={[
                    {
                        name: 'production',
                        type: 'production',
                        enabled: true,
                        hasStrategies: true,
                        hasEnabledStrategies: true,
                        changeRequestIds: [],
                    },
                ]}
            />,
        );
        expect(getByText('–')).toBeInTheDocument();
    });

    it('shows "change requests" icon', () => {
        const { getByTestId } = render(
            <StatusCell
                project='test-project'
                lifecycle={{
                    stage: 'live',
                    enteredStageAt: '2025-04-01T00:00:00Z',
                }}
                environments={[
                    {
                        name: 'production',
                        type: 'production',
                        enabled: true,
                        hasStrategies: true,
                        hasEnabledStrategies: true,
                        changeRequestIds: [123],
                    },
                ]}
            />,
        );

        expect(getByTestId('change-requests-icon')).toBeInTheDocument();
    });

    it('shows change requests on focus', async () => {
        const ui = (
            <StatusCell
                project='test-project'
                lifecycle={{
                    stage: 'live',
                    enteredStageAt: '2025-04-01T00:00:00Z',
                }}
                environments={[
                    {
                        name: 'production',
                        type: 'production',
                        enabled: true,
                        hasStrategies: true,
                        hasEnabledStrategies: true,
                        changeRequestIds: [123],
                    },
                ]}
            />
        );
        const { getByTestId, getByText, rerender } = render(ui);

        expect(await screen.queryByText('Change requests:')).toBeNull();
        await userEvent.hover(getByTestId('change-requests-icon'));
        await screen.findByRole('tooltip');
        expect(
            await screen.queryByText('Change requests:'),
        ).toBeInTheDocument();
        expect(getByText('#123')).toBeInTheDocument();
    });
});
