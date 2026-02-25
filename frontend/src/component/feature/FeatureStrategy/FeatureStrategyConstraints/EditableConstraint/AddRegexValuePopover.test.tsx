import { screen, fireEvent, createEvent } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { describe, expect, test, vi } from 'vitest';
import { AddRegexValuePopover } from './AddRegexValuePopover';

const defaultProps = {
    open: true,
    anchorEl: document.body,
    onAdd: vi.fn(),
    onClose: vi.fn(),
    caseInsensitive: false,
    onToggleCaseSensitivity: vi.fn(),
    inverted: false,
    onToggleInverted: vi.fn(),
};

describe('AddRegexValuePopover – rendering', () => {
    test('renders the regex input and test section when open', () => {
        render(<AddRegexValuePopover {...defaultProps} />);
        expect(
            screen.getByPlaceholderText('Enter RE2 regex value'),
        ).toBeInTheDocument();
        expect(screen.getByText('Test regex')).toBeInTheDocument();
    });

    test('shows "Add" button text when no initialValue is provided', () => {
        render(<AddRegexValuePopover {...defaultProps} />);
        expect(
            screen.getByTestId('CONSTRAINT_VALUES_ADD_BUTTON'),
        ).toHaveTextContent('Add');
    });

    test('shows "Save" button text when an initialValue is provided', () => {
        render(
            <AddRegexValuePopover
                {...defaultProps}
                initialValue='^existing.*'
            />,
        );
        expect(
            screen.getByTestId('CONSTRAINT_VALUES_ADD_BUTTON'),
        ).toHaveTextContent('Save');
    });

    test('Add button is disabled when input is empty', () => {
        render(<AddRegexValuePopover {...defaultProps} />);
        expect(
            screen.getByTestId('CONSTRAINT_VALUES_ADD_BUTTON'),
        ).toBeDisabled();
    });

    test('Add button is enabled when input has a value', () => {
        render(<AddRegexValuePopover {...defaultProps} />);
        fireEvent.change(screen.getByPlaceholderText('Enter RE2 regex value'), {
            target: { value: '^foo' },
        });
        expect(
            screen.getByTestId('CONSTRAINT_VALUES_ADD_BUTTON'),
        ).toBeEnabled();
    });
});

describe('AddRegexValuePopover – form submission', () => {
    test('calls onAdd with the input value on valid submit', () => {
        const onAdd = vi.fn();
        render(<AddRegexValuePopover {...defaultProps} onAdd={onAdd} />);

        fireEvent.change(screen.getByPlaceholderText('Enter RE2 regex value'), {
            target: { value: '^foo$' },
        });
        fireEvent.click(screen.getByTestId('CONSTRAINT_VALUES_ADD_BUTTON'));

        expect(onAdd).toHaveBeenCalledWith(
            '^foo$',
            expect.objectContaining({
                setError: expect.any(Function),
                clearInput: expect.any(Function),
            }),
        );
    });

    test('shows error and does not call onAdd for whitespace-only input', () => {
        const onAdd = vi.fn();
        render(<AddRegexValuePopover {...defaultProps} onAdd={onAdd} />);

        // The Add button is disabled for empty input, so we need to manually
        // fire a form submit to test the whitespace guard
        const regexInput = screen.getByPlaceholderText('Enter RE2 regex value');
        fireEvent.change(regexInput, { target: { value: '   ' } });
        fireEvent.submit(regexInput.closest('form')!);

        expect(
            screen.getByText('Value cannot be empty or whitespace'),
        ).toBeInTheDocument();
        expect(onAdd).not.toHaveBeenCalled();
    });
});

describe('AddRegexValuePopover – regex matching', () => {
    test('shows no-match indicator when test string does not match the regex', () => {
        render(<AddRegexValuePopover {...defaultProps} />);

        fireEvent.change(screen.getByPlaceholderText('Enter RE2 regex value'), {
            target: { value: '^foo$' },
        });
        fireEvent.change(
            screen.getByPlaceholderText('Enter test context field value'),
            { target: { value: 'bar' } },
        );

        expect(
            screen.getByLabelText('Regex does not match'),
        ).toBeInTheDocument();
    });

    test('shows match indicator when test string matches the regex', () => {
        render(<AddRegexValuePopover {...defaultProps} />);

        fireEvent.change(screen.getByPlaceholderText('Enter RE2 regex value'), {
            target: { value: '^foo$' },
        });
        fireEvent.change(
            screen.getByPlaceholderText('Enter test context field value'),
            { target: { value: 'foo' } },
        );

        expect(screen.getByLabelText('Regex matches')).toBeInTheDocument();
    });

    test('updates match indicator when the regex input changes', () => {
        render(<AddRegexValuePopover {...defaultProps} />);

        const testInput = screen.getByPlaceholderText(
            'Enter test context field value',
        );
        const regexInput = screen.getByPlaceholderText('Enter RE2 regex value');

        fireEvent.change(testInput, { target: { value: 'hello' } });
        fireEvent.change(regexInput, { target: { value: 'hello' } });
        expect(screen.getByLabelText('Regex matches')).toBeInTheDocument();

        fireEvent.change(regexInput, { target: { value: 'world' } });
        expect(
            screen.getByLabelText('Regex does not match'),
        ).toBeInTheDocument();
    });

    test('case-insensitive flag makes matching case-insensitive', () => {
        render(
            <AddRegexValuePopover {...defaultProps} caseInsensitive={true} />,
        );

        fireEvent.change(screen.getByPlaceholderText('Enter RE2 regex value'), {
            target: { value: '^foo$' },
        });
        fireEvent.change(
            screen.getByPlaceholderText('Enter test context field value'),
            { target: { value: 'FOO' } },
        );

        expect(screen.getByLabelText('Regex matches')).toBeInTheDocument();
    });

    test('case-sensitive flag (caseInsensitive=false) does not match different case', () => {
        render(
            <AddRegexValuePopover {...defaultProps} caseInsensitive={false} />,
        );

        fireEvent.change(screen.getByPlaceholderText('Enter RE2 regex value'), {
            target: { value: '^foo$' },
        });
        fireEvent.change(
            screen.getByPlaceholderText('Enter test context field value'),
            { target: { value: 'FOO' } },
        );

        expect(
            screen.getByLabelText('Regex does not match'),
        ).toBeInTheDocument();
    });

    test('invalid regex shows no-match indicator without throwing', () => {
        render(<AddRegexValuePopover {...defaultProps} />);

        fireEvent.change(screen.getByPlaceholderText('Enter RE2 regex value'), {
            target: { value: '[invalid' },
        });
        fireEvent.change(
            screen.getByPlaceholderText('Enter test context field value'),
            { target: { value: 'anything' } },
        );

        // Should show no-match without crashing
        expect(
            screen.getByLabelText('Regex does not match'),
        ).toBeInTheDocument();
    });
});

describe('AddRegexValuePopover – inverted operator indicators', () => {
    test('does not show inverted match indicator when inverted=false', () => {
        render(<AddRegexValuePopover {...defaultProps} inverted={false} />);

        fireEvent.change(screen.getByPlaceholderText('Enter RE2 regex value'), {
            target: { value: '^foo$' },
        });
        fireEvent.change(
            screen.getByPlaceholderText('Enter test context field value'),
            { target: { value: 'foo' } },
        );

        expect(
            screen.queryByLabelText(/Exclusive constraint operator/),
        ).not.toBeInTheDocument();
    });

    test('shows inverted match indicator when inverted=true and regex matches', () => {
        render(<AddRegexValuePopover {...defaultProps} inverted={true} />);

        fireEvent.change(screen.getByPlaceholderText('Enter RE2 regex value'), {
            target: { value: '^foo$' },
        });
        fireEvent.change(
            screen.getByPlaceholderText('Enter test context field value'),
            { target: { value: 'foo' } },
        );

        expect(
            screen.getByLabelText(
                'Exclusive constraint operator: does not match',
            ),
        ).toBeInTheDocument();
    });

    test('shows inverted match indicator when inverted=true and regex does not match', () => {
        render(<AddRegexValuePopover {...defaultProps} inverted={true} />);

        fireEvent.change(screen.getByPlaceholderText('Enter RE2 regex value'), {
            target: { value: '^foo$' },
        });
        fireEvent.change(
            screen.getByPlaceholderText('Enter test context field value'),
            { target: { value: 'bar' } },
        );

        expect(
            screen.getByLabelText('Exclusive constraint operator: matches'),
        ).toBeInTheDocument();
    });
});

describe('AddRegexValuePopover – test string management', () => {
    test('starts with one empty test string row', () => {
        render(<AddRegexValuePopover {...defaultProps} />);
        expect(
            screen.getAllByPlaceholderText('Enter test context field value'),
        ).toHaveLength(1);
    });

    test('"Add test string" button appends a new test row', () => {
        render(<AddRegexValuePopover {...defaultProps} />);

        fireEvent.click(
            screen.getByRole('button', { name: /add test string/i }),
        );

        expect(
            screen.getAllByPlaceholderText('Enter test context field value'),
        ).toHaveLength(2);
    });

    test('remove button deletes the corresponding test row', () => {
        render(<AddRegexValuePopover {...defaultProps} />);

        // Add a second row first
        fireEvent.click(
            screen.getByRole('button', { name: /add test string/i }),
        );
        expect(
            screen.getAllByPlaceholderText('Enter test context field value'),
        ).toHaveLength(2);

        // Remove the first row (index 0)
        const removeButtons = screen.getAllByRole('button', {
            name: /remove test string/i,
        });
        fireEvent.click(removeButtons[0]);

        expect(
            screen.getAllByPlaceholderText('Enter test context field value'),
        ).toHaveLength(1);
    });

    test('removing a non-last row focuses the row that took its place', () => {
        render(<AddRegexValuePopover {...defaultProps} />);

        fireEvent.click(
            screen.getByRole('button', { name: /add test string/i }),
        );
        fireEvent.click(
            screen.getByRole('button', { name: /add test string/i }),
        );
        // 3 rows: indices 0, 1, 2
        const removeButtons = () =>
            screen.getAllByRole('button', { name: /remove test string/i });

        fireEvent.click(removeButtons()[0]); // remove index 0, index 1 shifts into 0

        const remaining = screen.getAllByPlaceholderText(
            'Enter test context field value',
        );
        expect(remaining).toHaveLength(2);
        expect(remaining[0]).toHaveFocus();
    });

    test('removing the last row focuses the new last row', () => {
        render(<AddRegexValuePopover {...defaultProps} />);

        fireEvent.click(
            screen.getByRole('button', { name: /add test string/i }),
        );
        // 2 rows: indices 0, 1
        const removeButtons = () =>
            screen.getAllByRole('button', { name: /remove test string/i });

        fireEvent.click(removeButtons()[1]); // remove index 1 (last)

        const remaining = screen.getAllByPlaceholderText(
            'Enter test context field value',
        );
        expect(remaining).toHaveLength(1);
        expect(remaining[0]).toHaveFocus();
    });

    test('removing the only remaining row focuses the "Add test string" button', () => {
        render(<AddRegexValuePopover {...defaultProps} />);

        fireEvent.click(
            screen.getByRole('button', { name: /remove test string/i }),
        );

        expect(
            screen.getByRole('button', { name: /add test string/i }),
        ).toHaveFocus();
    });
});

describe('AddRegexValuePopover – keyboard interactions', () => {
    test('pressing Enter submits the form and calls onAdd', () => {
        const onAdd = vi.fn();
        render(<AddRegexValuePopover {...defaultProps} onAdd={onAdd} />);

        const regexInput = screen.getByPlaceholderText('Enter RE2 regex value');
        fireEvent.change(regexInput, { target: { value: '^foo$' } });
        fireEvent.keyDown(regexInput, { key: 'Enter' });

        expect(onAdd).toHaveBeenCalledWith(
            '^foo$',
            expect.objectContaining({
                setError: expect.any(Function),
                clearInput: expect.any(Function),
            }),
        );
    });

    test('pressing Shift+Enter does not submit the form', () => {
        const onAdd = vi.fn();
        render(<AddRegexValuePopover {...defaultProps} onAdd={onAdd} />);

        const regexInput = screen.getByPlaceholderText('Enter RE2 regex value');
        fireEvent.change(regexInput, { target: { value: '^foo$' } });
        fireEvent.keyDown(regexInput, { key: 'Enter', shiftKey: true });

        expect(onAdd).not.toHaveBeenCalled();
    });

    test('pressing ArrowDown calls stopPropagation to preserve native cursor movement', () => {
        render(<AddRegexValuePopover {...defaultProps} />);

        const regexInput = screen.getByPlaceholderText('Enter RE2 regex value');
        // Give it multi-line content so cursor is NOT on last line
        fireEvent.change(regexInput, {
            target: { value: 'line1\nline2', selectionStart: 0 },
        });
        const event = createEvent.keyDown(regexInput, { key: 'ArrowDown' });
        const stopPropSpy = vi.spyOn(event, 'stopPropagation');
        fireEvent(regexInput, event);

        expect(stopPropSpy).toHaveBeenCalled();
    });

    test('pressing ArrowDown on the last line moves focus to the first test input', () => {
        render(<AddRegexValuePopover {...defaultProps} />);

        const regexInput = screen.getByPlaceholderText('Enter RE2 regex value');
        fireEvent.change(regexInput, { target: { value: '^foo$' } });
        // jsdom places cursor at end after change and does not process the
        // default cursor-movement action for ArrowDown, so selectionStart
        // remains unchanged between keyDown and keyUp – the "didn't move" signal.
        fireEvent.keyDown(regexInput, { key: 'ArrowDown' });
        fireEvent.keyUp(regexInput, { key: 'ArrowDown' });

        expect(
            screen.getByPlaceholderText('Enter test context field value'),
        ).toHaveFocus();
    });

    test('pressing ArrowDown on a non-last line does not move focus to the test input', () => {
        render(<AddRegexValuePopover {...defaultProps} />);

        const regexInput = screen.getByPlaceholderText('Enter RE2 regex value');
        fireEvent.change(regexInput, { target: { value: 'line1\nline2' } });
        // Place cursor at position 0 before keyDown so the saved position is 0.
        (regexInput as HTMLTextAreaElement).setSelectionRange(0, 0);
        fireEvent.keyDown(regexInput, { key: 'ArrowDown' });
        // Simulate the browser moving the cursor to a different position.
        (regexInput as HTMLTextAreaElement).setSelectionRange(6, 6);
        fireEvent.keyUp(regexInput, { key: 'ArrowDown' });

        expect(regexInput).toHaveFocus();
    });

    test('pressing ArrowUp in the first test input moves focus back to the regex input', () => {
        render(<AddRegexValuePopover {...defaultProps} />);

        const testInput = screen.getByPlaceholderText(
            'Enter test context field value',
        );
        testInput.focus();
        fireEvent.keyDown(testInput, { key: 'ArrowUp' });

        expect(
            screen.getByPlaceholderText('Enter RE2 regex value'),
        ).toHaveFocus();
    });

    test('pressing ArrowUp calls stopPropagation to preserve native cursor movement', () => {
        render(<AddRegexValuePopover {...defaultProps} />);

        const regexInput = screen.getByPlaceholderText('Enter RE2 regex value');
        const event = createEvent.keyDown(regexInput, { key: 'ArrowUp' });
        const stopPropSpy = vi.spyOn(event, 'stopPropagation');
        fireEvent(regexInput, event);

        expect(stopPropSpy).toHaveBeenCalled();
    });

    test('pressing other keys does not call stopPropagation', () => {
        render(<AddRegexValuePopover {...defaultProps} />);

        const regexInput = screen.getByPlaceholderText('Enter RE2 regex value');
        const event = createEvent.keyDown(regexInput, { key: 'a' });
        const stopPropSpy = vi.spyOn(event, 'stopPropagation');
        fireEvent(regexInput, event);

        expect(stopPropSpy).not.toHaveBeenCalled();
    });
});

describe('AddRegexValuePopover – state reset on open', () => {
    test('resets inputValue to initialValue when popover re-opens', () => {
        const { rerender } = render(
            <AddRegexValuePopover
                {...defaultProps}
                open={true}
                initialValue='initial-pattern'
            />,
        );

        const regexInput = screen.getByPlaceholderText('Enter RE2 regex value');
        expect(regexInput).toHaveValue('initial-pattern');

        // Simulate user editing the value
        fireEvent.change(regexInput, { target: { value: 'modified-pattern' } });
        expect(regexInput).toHaveValue('modified-pattern');

        // Close and reopen the popover
        rerender(
            <AddRegexValuePopover
                {...defaultProps}
                open={false}
                initialValue='initial-pattern'
            />,
        );
        rerender(
            <AddRegexValuePopover
                {...defaultProps}
                open={true}
                initialValue='initial-pattern'
            />,
        );

        expect(
            screen.getByPlaceholderText('Enter RE2 regex value'),
        ).toHaveValue('initial-pattern');
    });

    test('clears error message when popover re-opens', () => {
        const onAdd = vi.fn();
        const { rerender } = render(
            <AddRegexValuePopover
                {...defaultProps}
                open={true}
                onAdd={onAdd}
            />,
        );

        // Trigger an error by submitting whitespace
        const regexInput = screen.getByPlaceholderText('Enter RE2 regex value');
        fireEvent.change(regexInput, { target: { value: '   ' } });
        fireEvent.submit(regexInput.closest('form')!);
        expect(
            screen.getByText('Value cannot be empty or whitespace'),
        ).toBeInTheDocument();

        // Close and reopen
        rerender(
            <AddRegexValuePopover
                {...defaultProps}
                open={false}
                onAdd={onAdd}
            />,
        );
        rerender(
            <AddRegexValuePopover
                {...defaultProps}
                open={true}
                onAdd={onAdd}
            />,
        );

        expect(
            screen.queryByText('Value cannot be empty or whitespace'),
        ).not.toBeInTheDocument();
    });
});
