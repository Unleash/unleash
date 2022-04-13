import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import {
    ISelectProjectInputProps,
    SelectProjectInput,
} from './SelectProjectInput';

const onChange = jest.fn();
const onFocus = jest.fn();

const mockProps: ISelectProjectInputProps = {
    options: [
        { label: 'Project1', value: 'project1' },
        { label: 'Project2', value: 'project2' },
        { label: 'Project3', value: 'project3' },
    ],
    defaultValue: ['*'],
    onChange,
    onFocus,
};

describe('SelectProjectInput', () => {
    beforeEach(() => {
        onChange.mockClear();
        onFocus.mockClear();
    });

    it('renders with default state', () => {
        render(<SelectProjectInput {...mockProps} />);

        const checkbox = screen.getByLabelText(
            /all current and future projects/i
        );
        expect(checkbox).toBeChecked();

        const selectInputContainer = screen.getByTestId('select-input');
        const input = within(selectInputContainer).getByRole('textbox');
        expect(input).toBeDisabled();
    });

    it('can toggle "ALL" checkbox', async () => {
        const user = userEvent.setup();
        render(<SelectProjectInput {...mockProps} />);

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
            <SelectProjectInput {...mockProps} defaultValue={['project1']} />
        );

        const checkbox = screen.getByLabelText(
            /all current and future projects/i
        );
        expect(checkbox).not.toBeChecked();

        const selectInputContainer = screen.getByTestId('select-input');
        const input = within(selectInputContainer).getByRole('textbox');
        expect(input).toBeEnabled();
    });

    describe('Select/Deselect projects in dropdown', () => {
        it('selects and deselects all options', async () => {
            const user = userEvent.setup();
            render(<SelectProjectInput {...mockProps} defaultValue={[]} />);
            await user.click(screen.getByLabelText('Projects'));

            let button = screen.getByRole('button', {
                name: /select all/i,
            });
            expect(button).toBeInTheDocument();
            await user.click(button);

            expect(onChange).toHaveBeenCalledWith([
                'project1',
                'project2',
                'project3',
            ]);

            button = screen.getByRole('button', {
                name: /deselect all/i,
            });
            expect(button).toBeInTheDocument();
            await user.click(button);
            expect(onChange).toHaveBeenCalledWith([]);
        });

        it("doesn't show up for less than 3 options", async () => {
            const user = userEvent.setup();
            render(
                <SelectProjectInput
                    {...mockProps}
                    defaultValue={[]}
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
            <SelectProjectInput
                {...mockProps}
                defaultValue={[]}
                options={[
                    { label: 'Alpha', value: 'alpha' },
                    { label: 'Bravo', value: 'bravo' },
                    { label: 'Charlie', value: 'charlie' },
                    { label: 'Alpaca', value: 'alpaca' },
                ]}
            />
        );
        const input = await screen.findByLabelText('Projects');
        user.type(input, 'alp');

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

        user.clear(input);
        user.type(input, 'bravo');
        await waitFor(() => {
            expect(screen.getByText('Bravo')).toBeVisible();
        });
        await waitFor(() => {
            expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
        });
    });
});
