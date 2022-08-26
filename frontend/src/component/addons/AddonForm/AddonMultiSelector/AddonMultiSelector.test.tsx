import { vi } from 'vitest';
import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import {
    IAddonMultiSelectorProps,
    AddonMultiSelector,
} from './AddonMultiSelector';

const onChange = vi.fn();
const onFocus = vi.fn();

const mockProps: IAddonMultiSelectorProps = {
    options: [
        { label: 'Project1', value: 'project1' },
        { label: 'Project2', value: 'project2' },
        { label: 'Project3', value: 'project3' },
    ],
    selectedItems: [],
    onChange,
    onFocus,
    selectAllEnabled: true,
    entityName: 'project',
};

describe('AddonMultiSelector', () => {
    beforeEach(() => {
        onChange.mockClear();
        onFocus.mockClear();
    });

    it('renders with default state', () => {
        render(<AddonMultiSelector {...mockProps} selectedItems={['*']} />);

        const checkbox = screen.getByLabelText(
            /all current and future projects/i
        );
        expect(checkbox).toBeChecked();

        const selectInputContainer = screen.getByTestId('select-project-input');
        const input = within(selectInputContainer).getByRole('combobox');
        expect(input).toBeDisabled();
    });

    it('can toggle "ALL" checkbox', async () => {
        const user = userEvent.setup();
        render(<AddonMultiSelector {...mockProps} selectedItems={['*']} />);

        await user.click(screen.getByTestId('select-all-projects'));

        expect(
            screen.getByLabelText(/all current and future projects/i)
        ).not.toBeChecked();

        expect(screen.getByLabelText('Projects')).toBeEnabled();

        await user.click(screen.getByTestId('select-all-projects'));

        expect(
            screen.getByLabelText(/all current and future projects/i)
        ).toBeChecked();

        expect(screen.getByLabelText('Projects')).toBeDisabled();
    });

    it('renders with autocomplete enabled if default value is not a wildcard', () => {
        render(
            <AddonMultiSelector {...mockProps} selectedItems={['project1']} />
        );

        const checkbox = screen.getByLabelText(
            /all current and future projects/i
        );
        expect(checkbox).not.toBeChecked();

        const selectInputContainer = screen.getByTestId('select-project-input');
        const input = within(selectInputContainer).getByRole('combobox');
        expect(input).toBeEnabled();
    });

    describe('Select/Deselect projects in dropdown', () => {
        it("doesn't show up for less than 3 options", async () => {
            const user = userEvent.setup();
            render(
                <AddonMultiSelector
                    {...mockProps}
                    selectedItems={[]}
                    options={[
                        { label: 'Project1', value: 'project1' },
                        { label: 'Project2', value: 'project2' },
                    ]}
                />
            );
            await user.click(screen.getByLabelText('Projects'));

            const button = screen.queryByRole('button', {
                name: /select all/i,
            });
            expect(button).not.toBeInTheDocument();
        });
    });

    it('can filter options', async () => {
        const user = userEvent.setup();
        render(
            <AddonMultiSelector
                {...mockProps}
                selectedItems={[]}
                options={[
                    { label: 'Alpha', value: 'alpha' },
                    { label: 'Bravo', value: 'bravo' },
                    { label: 'Charlie', value: 'charlie' },
                    { label: 'Alpaca', value: 'alpaca' },
                ]}
            />
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
