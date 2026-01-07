import { vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import {
    type IIntegrationMultiSelectorProps,
    IntegrationMultiSelector,
} from './IntegrationMultiSelector.tsx';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const onChange = vi.fn();
const onFocus = vi.fn();

const mockProps: IIntegrationMultiSelectorProps = {
    options: [
        { label: 'Project1', value: 'project1' },
        { label: 'Project2', value: 'project2' },
        { label: 'Project3', value: 'project3' },
    ],
    selectedItems: [],
    onChange,
    onFocus,
    entityName: 'project',
    description: 'some description',
};

const server = testServerSetup();

describe('AddonMultiSelector', () => {
    beforeEach(() => {
        onChange.mockClear();
        onFocus.mockClear();
        testServerRoute(server, '/api/admin/ui-config', {});
    });

    it('renders with default state', () => {
        render(<IntegrationMultiSelector {...mockProps} />);

        const selectInputContainer = screen.getByTestId('select-project-input');
        const input = within(selectInputContainer).getByRole('combobox');
        expect(input).toBeEnabled();
    });

    it('can filter options', async () => {
        const user = userEvent.setup();
        render(
            <IntegrationMultiSelector
                {...mockProps}
                options={[
                    { label: 'Alpha', value: 'alpha' },
                    { label: 'Bravo', value: 'bravo' },
                    { label: 'Charlie', value: 'charlie' },
                    { label: 'Alpaca', value: 'alpaca' },
                ]}
            />,
        );
        const input = await screen.findByLabelText('Projects');
        await user.type(input, 'alp');

        await waitFor(() => {
            expect(screen.getByText('Alpha')).toBeVisible();
        });
        await waitFor(() => {
            expect(screen.queryByText('Bravo')).not.toBeInTheDocument();
        });
        await waitFor(() => {
            expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
        });
        await waitFor(() => {
            expect(screen.getByText('Alpaca')).toBeVisible();
        });

        await user.clear(input);
        await user.type(input, 'bravo');
        await waitFor(() => {
            expect(screen.getByText('Bravo')).toBeVisible();
        });
        await waitFor(() => {
            expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
        });
    });
});
