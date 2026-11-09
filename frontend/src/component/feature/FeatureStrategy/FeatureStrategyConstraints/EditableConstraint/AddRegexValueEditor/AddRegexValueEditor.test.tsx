import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { describe, expect, test, vi } from 'vitest';
import { AddRegexValueEditor } from './AddRegexValueEditor';

const defaultProps = {
    value: '',
    caseInsensitive: false,
};

describe('AddRegexValueEditor', () => {
    describe('initial render', () => {
        test('renders correctly', () => {
            render(<AddRegexValueEditor {...defaultProps} />);

            expect(
                screen.getByRole('heading', { name: 'Test regex' }),
            ).toBeInTheDocument();

            const testInputs =
                screen.getAllByPlaceholderText('Enter test value');
            expect(testInputs).toHaveLength(1);
            expect(testInputs[0]).toHaveValue('');

            expect(
                screen.getByRole('button', { name: /add test string/i }),
            ).toBeInTheDocument();
        });

        test('remove button is not rendered when only one test string exists', () => {
            render(<AddRegexValueEditor {...defaultProps} />);

            expect(
                screen.queryByRole('button', { name: /remove test string/i }),
            ).not.toBeInTheDocument();
        });
    });

    describe('test string management', () => {
        test('adds a new test string when "Add test string" is clicked', () => {
            render(<AddRegexValueEditor {...defaultProps} value='[abc]' />);

            fireEvent.click(
                screen.getByRole('button', { name: /add test string/i }),
            );

            expect(
                screen.getAllByPlaceholderText('Enter test value'),
            ).toHaveLength(2);
            const inputs = screen.getAllByPlaceholderText('Enter test value');
            expect(inputs[inputs.length - 1]).toHaveFocus();

            expect(
                screen.getAllByLabelText(/does not match empty strings/i),
            ).toHaveLength(2);
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
            const inputs = screen.getAllByPlaceholderText('Enter test value');
            expect(inputs[inputs.length - 1]).toHaveFocus();
        });
    });

    describe('test string input', () => {
        test('pressing Enter does not submit the form', async () => {
            const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
            render(
                <form onSubmit={onSubmit}>
                    <AddRegexValueEditor {...defaultProps} />
                </form>,
            );

            const testInput = screen.getByPlaceholderText('Enter test value');
            await userEvent.type(testInput, '{Enter}');

            expect(onSubmit).not.toHaveBeenCalled();
        });
    });

    describe('match indicators', () => {
        test('shows "does not match empty strings" for empty test string when regex does not match empty string', () => {
            // \w+ requires at least one word char, so it does not match ""
            render(<AddRegexValueEditor {...defaultProps} value='\w+' />);

            expect(
                screen.getByLabelText(/does not match empty strings/i),
            ).toBeInTheDocument();
        });

        test('shows "matches" when regex matches the test string', () => {
            render(<AddRegexValueEditor {...defaultProps} value='[abc]' />);

            const testInput = screen.getByPlaceholderText('Enter test value');
            fireEvent.change(testInput, { target: { value: 'a' } });

            expect(
                screen.getByLabelText(/your regular expression matches\.$/i),
            ).toBeInTheDocument();
        });

        test('shows "does not match" when regex does not match the test string', () => {
            render(<AddRegexValueEditor {...defaultProps} value='[abc]' />);

            const testInput = screen.getByPlaceholderText('Enter test value');
            fireEvent.change(testInput, { target: { value: 'z' } });

            expect(
                screen.getByLabelText(
                    /your regular expression does not match\.$/i,
                ),
            ).toBeInTheDocument();
        });

        test('shows "matches an empty string" when regex matches empty string and test input is empty', () => {
            render(<AddRegexValueEditor {...defaultProps} value='.*' />);

            // The single test input starts empty; .* matches empty string
            expect(
                screen.getByLabelText(/matches an empty string/i),
            ).toBeInTheDocument();
        });

        test('updates match status when test string changes', () => {
            // [0-9]+ matches digits but not letters
            render(<AddRegexValueEditor {...defaultProps} value='[0-9]+' />);

            const testInput = screen.getByPlaceholderText('Enter test value');

            fireEvent.change(testInput, { target: { value: 'hello' } });
            expect(
                screen.getByLabelText(
                    /your regular expression does not match\.$/i,
                ),
            ).toBeInTheDocument();

            fireEvent.change(testInput, { target: { value: '123' } });
            expect(
                screen.getByLabelText(/your regular expression matches\.$/i),
            ).toBeInTheDocument();
        });
    });

    describe('case sensitivity', () => {
        test('case-sensitive: does not match different case', () => {
            render(
                <AddRegexValueEditor
                    {...defaultProps}
                    value='hello'
                    caseInsensitive={false}
                />,
            );

            const testInput = screen.getByPlaceholderText('Enter test value');
            fireEvent.change(testInput, { target: { value: 'HELLO' } });

            expect(
                screen.getByLabelText(/does not match\.$/i),
            ).toBeInTheDocument();
        });

        test('case-insensitive: matches different case', () => {
            render(
                <AddRegexValueEditor
                    {...defaultProps}
                    value='hello'
                    caseInsensitive={true}
                />,
            );

            const testInput = screen.getByPlaceholderText('Enter test value');
            fireEvent.change(testInput, { target: { value: 'HELLO' } });

            expect(
                screen.getByLabelText(/your regular expression matches\.$/i),
            ).toBeInTheDocument();
        });
    });
});
