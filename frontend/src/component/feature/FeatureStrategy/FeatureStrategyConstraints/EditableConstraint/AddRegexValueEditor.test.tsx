import { screen, fireEvent } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { describe, expect, test, vi } from 'vitest';
import { AddRegexValueEditor } from './AddRegexValueEditor';
import type { ConstraintValidatorOutput } from './ConstraintValidatorOutput';

const validValidator = (_: string): ConstraintValidatorOutput => [true, ''];
const invalidValidator =
    (msg: string) =>
    (_: string): ConstraintValidatorOutput => [false, msg];

const defaultProps = {
    addValue: vi.fn(),
    caseInsensitive: false,
    setEditingOpen: vi.fn(),
    validator: validValidator,
};

describe('AddRegexValueEditor', () => {
    describe('initial render', () => {
        test('renders heading and subheadings', () => {
            render(<AddRegexValueEditor {...defaultProps} />);

            expect(
                screen.getByRole('heading', { name: 'Regular expression' }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole('heading', { name: 'Test regex' }),
            ).toBeInTheDocument();
        });

        test('renders the regex input', () => {
            render(<AddRegexValueEditor {...defaultProps} />);

            expect(
                screen.getByTestId('CONSTRAINT_VALUES_INPUT'),
            ).toBeInTheDocument();
        });

        test('renders with initialValue pre-filled', () => {
            render(
                <AddRegexValueEditor {...defaultProps} initialValue='[abc]' />,
            );

            expect(
                screen
                    .getByTestId('CONSTRAINT_VALUES_INPUT')
                    .querySelector('textarea'),
            ).toHaveValue('[abc]');
        });

        test('renders one empty test string input by default', () => {
            render(<AddRegexValueEditor {...defaultProps} />);

            const testInputs =
                screen.getAllByPlaceholderText('Enter test value');
            expect(testInputs).toHaveLength(1);
            expect(testInputs[0]).toHaveValue('');
        });

        test('renders "Add test string" button', () => {
            render(<AddRegexValueEditor {...defaultProps} />);

            expect(
                screen.getByRole('button', { name: /add test string/i }),
            ).toBeInTheDocument();
        });

        test('renders helpText when provided', () => {
            render(
                <AddRegexValueEditor
                    {...defaultProps}
                    helpText='Use RE2 syntax'
                />,
            );

            expect(screen.getByText('Use RE2 syntax')).toBeInTheDocument();
        });

        test('remove button is not rendered when only one test string exists', () => {
            render(<AddRegexValueEditor {...defaultProps} />);

            expect(
                screen.queryByRole('button', { name: /remove test string/i }),
            ).not.toBeInTheDocument();
        });
    });

    describe('regex input', () => {
        test('calls addValue when regex input changes', () => {
            const addValue = vi.fn();
            render(
                <AddRegexValueEditor {...defaultProps} addValue={addValue} />,
            );

            const textarea = screen
                .getByTestId('CONSTRAINT_VALUES_INPUT')
                .querySelector('textarea')!;
            fireEvent.change(textarea, { target: { value: '[abc]' } });

            expect(addValue).toHaveBeenCalledWith('[abc]');
        });

        test('shows validator error message', () => {
            render(
                <AddRegexValueEditor
                    {...defaultProps}
                    validator={invalidValidator('Invalid regex')}
                    initialValue='['
                />,
            );

            expect(screen.getByText('Invalid regex')).toBeInTheDocument();
        });

        test('shows error for values longer than 100 characters', () => {
            const longValue = 'a'.repeat(101);
            render(
                <AddRegexValueEditor
                    {...defaultProps}
                    initialValue={longValue}
                />,
            );

            expect(
                screen.getByText(
                    /values cannot be longer than 100 characters/i,
                ),
            ).toBeInTheDocument();
        });

        test('shows error on Enter when value is empty', () => {
            render(<AddRegexValueEditor {...defaultProps} />);

            const textarea = screen
                .getByTestId('CONSTRAINT_VALUES_INPUT')
                .querySelector('textarea')!;
            fireEvent.keyDown(textarea, { key: 'Enter' });

            expect(
                screen.getByText('Value cannot be empty or whitespace'),
            ).toBeInTheDocument();
        });

        test('shows error on Enter when value is only whitespace', () => {
            render(<AddRegexValueEditor {...defaultProps} />);

            const textarea = screen
                .getByTestId('CONSTRAINT_VALUES_INPUT')
                .querySelector('textarea')!;
            fireEvent.change(textarea, { target: { value: '   ' } });
            fireEvent.keyDown(textarea, { key: 'Enter' });

            expect(
                screen.getByText('Value cannot be empty or whitespace'),
            ).toBeInTheDocument();
        });

        test('does not show error on Shift+Enter', () => {
            render(<AddRegexValueEditor {...defaultProps} />);

            const textarea = screen
                .getByTestId('CONSTRAINT_VALUES_INPUT')
                .querySelector('textarea')!;
            fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

            expect(
                screen.queryByText('Value cannot be empty or whitespace'),
            ).not.toBeInTheDocument();
        });

        test('moves focus to the first test input on Enter with a valid value', () => {
            render(
                <AddRegexValueEditor {...defaultProps} initialValue='[abc]' />,
            );

            const textarea = screen
                .getByTestId('CONSTRAINT_VALUES_INPUT')
                .querySelector('textarea')!;
            fireEvent.keyDown(textarea, { key: 'Enter' });

            expect(
                screen.getByPlaceholderText('Enter test value'),
            ).toHaveFocus();
        });
    });

    describe('test string management', () => {
        test('adds a new test string when "Add test string" is clicked', () => {
            render(<AddRegexValueEditor {...defaultProps} />);

            fireEvent.click(
                screen.getByRole('button', { name: /add test string/i }),
            );

            expect(
                screen.getAllByPlaceholderText('Enter test value'),
            ).toHaveLength(2);
        });

        test('remove button is enabled when more than one test string exists', () => {
            render(<AddRegexValueEditor {...defaultProps} />);

            fireEvent.click(
                screen.getByRole('button', { name: /add test string/i }),
            );

            const removeButtons = screen.getAllByRole('button', {
                name: /remove test string/i,
            });
            for (const btn of removeButtons) {
                expect(btn).not.toBeDisabled();
            }
        });

        test('removes a test string when remove button is clicked', () => {
            render(<AddRegexValueEditor {...defaultProps} />);

            fireEvent.click(
                screen.getByRole('button', { name: /add test string/i }),
            );
            expect(
                screen.getAllByPlaceholderText('Enter test value'),
            ).toHaveLength(2);

            const removeButtons = screen.getAllByRole('button', {
                name: /remove test string/i,
            });
            fireEvent.click(removeButtons[0]);

            expect(
                screen.getAllByPlaceholderText('Enter test value'),
            ).toHaveLength(1);
        });
    });

    describe('match indicators', () => {
        test('shows "does not match empty strings" for empty test string when regex does not match empty string', () => {
            // \w+ requires at least one word char, so it does not match ""
            render(
                <AddRegexValueEditor {...defaultProps} initialValue='\w+' />,
            );

            expect(
                screen.getByText(/does not match empty strings/i),
            ).toBeInTheDocument();
        });

        test('shows "matches" when regex matches the test string', () => {
            render(
                <AddRegexValueEditor {...defaultProps} initialValue='[abc]' />,
            );

            const testInput = screen.getByPlaceholderText('Enter test value');
            fireEvent.change(testInput, { target: { value: 'a' } });

            expect(
                screen.getByText(/your regular expression matches$/i),
            ).toBeInTheDocument();
        });

        test('shows "does not match" when regex does not match the test string', () => {
            render(
                <AddRegexValueEditor {...defaultProps} initialValue='[abc]' />,
            );

            const testInput = screen.getByPlaceholderText('Enter test value');
            fireEvent.change(testInput, { target: { value: 'z' } });

            expect(
                screen.getByText(/your regular expression does not match$/i),
            ).toBeInTheDocument();
        });

        test('shows "matches an empty string" when regex matches empty string and test input is empty', () => {
            render(<AddRegexValueEditor {...defaultProps} initialValue='.*' />);

            // The single test input starts empty; .* matches empty string
            expect(
                screen.getByText(/matches an empty string/i),
            ).toBeInTheDocument();
        });

        test('updates match status when test string changes', () => {
            // [0-9]+ matches digits but not letters
            render(
                <AddRegexValueEditor {...defaultProps} initialValue='[0-9]+' />,
            );

            const testInput = screen.getByPlaceholderText('Enter test value');

            fireEvent.change(testInput, { target: { value: 'hello' } });
            expect(
                screen.getByText(/your regular expression does not match$/i),
            ).toBeInTheDocument();

            fireEvent.change(testInput, { target: { value: '123' } });
            expect(
                screen.getByText(/your regular expression matches$/i),
            ).toBeInTheDocument();
        });
    });

    describe('case sensitivity', () => {
        test('case-sensitive: does not match different case', () => {
            render(
                <AddRegexValueEditor
                    {...defaultProps}
                    initialValue='hello'
                    caseInsensitive={false}
                />,
            );

            const testInput = screen.getByPlaceholderText('Enter test value');
            fireEvent.change(testInput, { target: { value: 'HELLO' } });

            expect(screen.getByText(/does not match$/i)).toBeInTheDocument();
        });

        test('case-insensitive: matches different case', () => {
            render(
                <AddRegexValueEditor
                    {...defaultProps}
                    initialValue='hello'
                    caseInsensitive={true}
                />,
            );

            const testInput = screen.getByPlaceholderText('Enter test value');
            fireEvent.change(testInput, { target: { value: 'HELLO' } });

            expect(
                screen.getByText(/your regular expression matches$/i),
            ).toBeInTheDocument();
        });
    });
});
