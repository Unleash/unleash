import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
            ipConstraintOperator: true,
        },
    });
    testServerRoute(server, '/api/admin/context', [{ name: 'appName' }]);
};

describe('EditableConstraint', () => {
    describe('REGEX constraint with an existing invalid value', () => {
        test('opens the regex editor and shows a validation error', async () => {
            setupApi();

            const constraint: IConstraint = {
                contextName: 'appName',
                operator: 'REGEX',
                value: '[invalid',
            };

            render(
                <EditableConstraint
                    constraint={constraint}
                    onDelete={vi.fn()}
                    onUpdate={vi.fn()}
                />,
            );

            await screen.findByTestId('CONSTRAINT_VALUES_INPUT');
            await screen.findByText(/value must be a valid RE2 regex/i);
        });
    });

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

    describe('IN_CIDR constraint', () => {
        test('selects the IN_CIDR operator and adds an IP value', async () => {
            setupApi();
            const onUpdate = vi.fn();

            render(
                <EditableConstraint
                    constraint={{
                        contextName: 'appName',
                        operator: 'IN',
                        values: [],
                    }}
                    onDelete={vi.fn()}
                    onUpdate={onUpdate}
                />,
            );

            fireEvent.mouseDown(
                await screen.findByRole('combobox', { name: /operator/i }),
            );
            fireEvent.click(
                await screen.findByRole('option', { name: /is an IP in/i }),
            );

            await screen.findByText(
                /IP constraints require these SDK versions/,
            );

            fireEvent.click(
                await screen.findByTestId('CONSTRAINT_ADD_VALUES_BUTTON'),
            );
            await screen.findByText(
                'IP addresses or CIDR ranges, for example 192.168.1.1 or 10.0.0.0/8',
            );
            await userEvent.type(
                await screen.findByLabelText('Constraint Value'),
                '10.0.0.0/8',
            );
            fireEvent.click(screen.getByTestId('CONSTRAINT_VALUES_ADD_BUTTON'));

            await waitFor(() => {
                expect(onUpdate.mock.lastCall?.[0]).toMatchObject({
                    operator: 'IN_CIDR',
                    values: ['10.0.0.0/8'],
                });
            });
        });
    });
});
