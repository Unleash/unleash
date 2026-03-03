import { screen, fireEvent } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { describe, expect, test, vi } from 'vitest';
import { AddRegexConstraintValueWidget } from './AddRegexConstraintValueWidget';
import type { ConstraintValidatorOutput } from './ConstraintValidatorOutput';

const validValidator = (_: string): ConstraintValidatorOutput => [true, ''];
const invalidValidator = (_: string): ConstraintValidatorOutput => [
    false,
    'Invalid regex',
];

const defaultProps = {
    removeValue: vi.fn(),
    editingOpen: false,
    setEditingOpen: vi.fn(),
    validator: validValidator,
};

describe('AddRegexConstraintValueWidget', () => {
    describe('without a currentValue', () => {
        test('renders "Add value" label', () => {
            render(<AddRegexConstraintValueWidget {...defaultProps} />);

            expect(screen.getByText('Add value')).toBeInTheDocument();
        });

        test('renders an add (+) icon', () => {
            render(<AddRegexConstraintValueWidget {...defaultProps} />);

            expect(screen.getByTestId('AddIcon')).toBeInTheDocument();
        });

        test('does not render a delete button', () => {
            render(<AddRegexConstraintValueWidget {...defaultProps} />);

            expect(screen.queryByTestId('ClearIcon')).not.toBeInTheDocument();
        });

        test('calls setEditingOpen(true) when clicked', () => {
            const setEditingOpen = vi.fn();
            render(
                <AddRegexConstraintValueWidget
                    {...defaultProps}
                    setEditingOpen={setEditingOpen}
                />,
            );

            fireEvent.click(screen.getByText('Add value'));

            expect(setEditingOpen).toHaveBeenCalledWith(true);
        });
    });

    describe('with a currentValue', () => {
        test('renders the current value as the chip label', () => {
            render(
                <AddRegexConstraintValueWidget
                    {...defaultProps}
                    currentValue='[abc]+'
                />,
            );

            expect(screen.getByText('[abc]+')).toBeInTheDocument();
        });

        test('does not render the add (+) icon', () => {
            render(
                <AddRegexConstraintValueWidget
                    {...defaultProps}
                    currentValue='[abc]+'
                />,
            );

            expect(screen.queryByTestId('AddIcon')).not.toBeInTheDocument();
        });

        test('renders a delete button', () => {
            render(
                <AddRegexConstraintValueWidget
                    {...defaultProps}
                    currentValue='[abc]+'
                />,
            );

            expect(screen.getByTestId('ClearIcon')).toBeInTheDocument();
        });

        test('clicking delete calls removeValue', () => {
            const removeValue = vi.fn();
            render(
                <AddRegexConstraintValueWidget
                    {...defaultProps}
                    currentValue='[abc]+'
                    removeValue={removeValue}
                />,
            );

            fireEvent.click(screen.getByTestId('ClearIcon'));

            expect(removeValue).toHaveBeenCalledOnce();
        });

        test('clicking the label opens the editor when editingOpen=false', () => {
            const setEditingOpen = vi.fn();
            render(
                <AddRegexConstraintValueWidget
                    {...defaultProps}
                    currentValue='[abc]+'
                    editingOpen={false}
                    setEditingOpen={setEditingOpen}
                />,
            );

            fireEvent.click(screen.getByText('[abc]+'));

            expect(setEditingOpen).toHaveBeenCalledWith(true);
        });

        test('clicking the label closes the editor when editingOpen=true', () => {
            const setEditingOpen = vi.fn();
            render(
                <AddRegexConstraintValueWidget
                    {...defaultProps}
                    currentValue='[abc]+'
                    editingOpen={true}
                    setEditingOpen={setEditingOpen}
                />,
            );

            fireEvent.click(screen.getByText('[abc]+'));

            expect(setEditingOpen).toHaveBeenCalledWith(false);
        });

        test('clicking the label opens the editor when validator returns invalid and editingOpen=false', () => {
            const setEditingOpen = vi.fn();
            render(
                <AddRegexConstraintValueWidget
                    {...defaultProps}
                    currentValue='['
                    editingOpen={false}
                    setEditingOpen={setEditingOpen}
                    validator={invalidValidator}
                />,
            );

            fireEvent.click(screen.getByText('['));

            expect(setEditingOpen).toHaveBeenCalledWith(true);
        });

        test('clicking the label opens the editor when validator returns invalid and editingOpen=true', () => {
            const setEditingOpen = vi.fn();
            render(
                <AddRegexConstraintValueWidget
                    {...defaultProps}
                    currentValue='['
                    editingOpen={true}
                    setEditingOpen={setEditingOpen}
                    validator={invalidValidator}
                />,
            );

            fireEvent.click(screen.getByText('['));

            expect(setEditingOpen).toHaveBeenCalledWith(true);
        });
    });
});
