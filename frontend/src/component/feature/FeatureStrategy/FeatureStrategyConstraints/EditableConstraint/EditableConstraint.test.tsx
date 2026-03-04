import { screen, fireEvent } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { describe, expect, test, vi } from 'vitest';
import { EditableConstraint } from './EditableConstraint';
import type { IConstraint } from 'interfaces/strategy';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            regexConstraintOperator: true,
        },
    });
    testServerRoute(server, '/api/admin/context', [{ name: 'appName' }]);
};

describe('EditableConstraint', () => {
    describe('REGEX constraint with an existing valid value', () => {
        test('opens the regex editor when operator changes away from and back to REGEX', async () => {
            setupApi();

            const constraint: IConstraint = {
                contextName: 'appName',
                operator: 'REGEX',
                value: '[abc]+',
            };

            render(
                <EditableConstraint
                    constraint={constraint}
                    onDelete={vi.fn()}
                    onUpdate={vi.fn()}
                />,
            );

            // Wait for component to render; editor should be closed (value exists)
            await screen.findByText('[abc]+');
            expect(
                screen.queryByTestId('CONSTRAINT_VALUES_INPUT'),
            ).not.toBeInTheDocument();

            // Change operator away from REGEX (this clears the value)
            fireEvent.mouseDown(
                screen.getByRole('combobox', { name: /operator/i }),
            );
            fireEvent.click(
                await screen.findByRole('option', { name: /is one of/i }),
            );

            // Change operator back to REGEX
            fireEvent.mouseDown(
                screen.getByRole('combobox', { name: /operator/i }),
            );
            fireEvent.click(
                await screen.findByRole('option', { name: /matches regex/i }),
            );

            // The editor should open automatically because the value was
            // cleared when the operator changed.
            await screen.findByTestId('CONSTRAINT_VALUES_INPUT');
        });
    });
});
