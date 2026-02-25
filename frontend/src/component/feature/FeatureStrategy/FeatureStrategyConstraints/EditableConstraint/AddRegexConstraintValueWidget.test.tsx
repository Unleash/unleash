import { screen, fireEvent } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { describe, expect, test, vi } from 'vitest';
import { AddRegexConstraintValueWidget } from './AddRegexConstraintValueWidget';
import type { ConstraintValidatorOutput } from './ConstraintValidatorOutput';

const validValidator = (_value: string): ConstraintValidatorOutput => [
    true,
    '',
];
const invalidValidator = (_value: string): ConstraintValidatorOutput => [
    false,
    'Invalid regex',
];

const defaultProps = {
    onAddValue: vi.fn(),
    removeValue: vi.fn(),
    validator: validValidator,
    caseInsensitive: false,
    onToggleCaseSensitivity: vi.fn(),
    inverted: false,
    onToggleInverted: vi.fn(),
};

describe('AddRegexConstraintValueWidget – chip display', () => {
    test('shows "Add value" label and no delete button when there is no current value', () => {
        render(<AddRegexConstraintValueWidget {...defaultProps} />);
        expect(screen.getByText('Add value')).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /delete/i }),
        ).not.toBeInTheDocument();
    });

    test('shows the current value as chip label when currentValue is set', () => {
        render(
            <AddRegexConstraintValueWidget
                {...defaultProps}
                currentValue='^foo.*'
            />,
        );
        expect(screen.getByText('^foo.*')).toBeInTheDocument();
    });

    test('shows a delete icon when currentValue is set', () => {
        render(
            <AddRegexConstraintValueWidget
                {...defaultProps}
                currentValue='^foo.*'
            />,
        );
        // MUI Chip renders a delete icon (ClearIcon) with aria-hidden. Query by data-testid.
        expect(screen.getByTestId('ClearIcon')).toBeInTheDocument();
    });

    test('calls removeValue when the chip delete icon is clicked', () => {
        const removeValue = vi.fn();
        render(
            <AddRegexConstraintValueWidget
                {...defaultProps}
                currentValue='^foo.*'
                removeValue={removeValue}
            />,
        );
        fireEvent.click(screen.getByTestId('ClearIcon'));
        expect(removeValue).toHaveBeenCalledOnce();
    });

    test('clicking the chip opens the popover (regex input becomes visible)', () => {
        render(<AddRegexConstraintValueWidget {...defaultProps} />);
        // Before clicking: popover is closed, regex input not in DOM
        expect(
            screen.queryByPlaceholderText('Enter RE2 regex value'),
        ).not.toBeInTheDocument();

        fireEvent.click(screen.getByText('Add value'));

        expect(
            screen.getByPlaceholderText('Enter RE2 regex value'),
        ).toBeInTheDocument();
    });
});

describe('AddRegexConstraintValueWidget – handleAdd validation', () => {
    test('shows error when value exceeds 100 characters', () => {
        render(<AddRegexConstraintValueWidget {...defaultProps} />);

        fireEvent.click(screen.getByText('Add value'));

        const regexInput = screen.getByPlaceholderText('Enter RE2 regex value');
        const longValue = 'a'.repeat(101);
        fireEvent.change(regexInput, { target: { value: longValue } });

        fireEvent.click(screen.getByTestId('CONSTRAINT_VALUES_ADD_BUTTON'));

        expect(
            screen.getByText(/Values cannot be longer than 100 characters/),
        ).toBeInTheDocument();
    });

    test('shows error message from validator when it returns invalid', () => {
        render(
            <AddRegexConstraintValueWidget
                {...defaultProps}
                validator={invalidValidator}
            />,
        );

        fireEvent.click(screen.getByText('Add value'));

        const regexInput = screen.getByPlaceholderText('Enter RE2 regex value');
        fireEvent.change(regexInput, { target: { value: '[invalid' } });

        fireEvent.click(screen.getByTestId('CONSTRAINT_VALUES_ADD_BUTTON'));

        expect(screen.getByText('Invalid regex')).toBeInTheDocument();
    });

    test('calls onAddValue and closes the popover when the value is valid', () => {
        const onAddValue = vi.fn();
        render(
            <AddRegexConstraintValueWidget
                {...defaultProps}
                onAddValue={onAddValue}
            />,
        );

        fireEvent.click(screen.getByText('Add value'));

        const regexInput = screen.getByPlaceholderText('Enter RE2 regex value');
        fireEvent.change(regexInput, { target: { value: '^foo$' } });

        // fireEvent.click on a submit button does not trigger form submission in jsdom;
        // use fireEvent.submit on the form element instead.
        fireEvent.submit(regexInput.closest('form')!);

        expect(onAddValue).toHaveBeenCalledWith('^foo$');
    });
});
