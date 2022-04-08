import React from 'react';
import { screen, within } from '@testing-library/react';
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
});
