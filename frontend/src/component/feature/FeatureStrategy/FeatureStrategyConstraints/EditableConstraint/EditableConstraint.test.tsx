import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { describe, expect, test, vi } from 'vitest';
import { EditableConstraint } from './EditableConstraint';
import type { IConstraint } from 'interfaces/strategy';
import type { IUnleashContextDefinition } from 'interfaces/context';

const server = testServerSetup();

const noOp = () => {};

const setupApi = ({
    contextFields = [{ name: 'appName' }],
}: {
    contextFields?: Partial<IUnleashContextDefinition>[];
} = {}) => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            regexConstraintOperator: true,
            ipConstraintOperator: true,
        },
    });
    testServerRoute(server, '/api/admin/context', contextFields);
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
                    onDelete={noOp}
                    onUpdate={noOp}
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
                    onDelete={noOp}
                    onUpdate={noOp}
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
        const ipConstraint: IConstraint = {
            contextName: 'appName',
            operator: 'IN_CIDR',
            values: [],
        };

        const openValuesPopover = async () => {
            fireEvent.click(
                await screen.findByTestId('CONSTRAINT_ADD_VALUES_BUTTON'),
            );
            return screen.findByLabelText('Constraint Value');
        };

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
                    onDelete={noOp}
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

        test('shows the target range while typing a valid value', async () => {
            setupApi();

            render(
                <EditableConstraint
                    constraint={ipConstraint}
                    onDelete={noOp}
                    onUpdate={noOp}
                />,
            );

            const input = await openValuesPopover();
            await userEvent.type(input, 'not-an-ip');
            expect(screen.queryByRole('status')).not.toBeInTheDocument();

            await userEvent.clear(input);
            await userEvent.type(input, '10.0.0.0/8');

            expect(await screen.findByRole('status')).toHaveTextContent(
                'Target range: 10.0.0.0 - 10.255.255.255',
            );
        });

        test('adds a valid value as a chip titled with its target range', async () => {
            setupApi();

            render(
                <EditableConstraint
                    constraint={ipConstraint}
                    onDelete={noOp}
                    onUpdate={noOp}
                />,
            );

            const input = await openValuesPopover();
            await userEvent.type(input, '10.0.0.0/8');
            fireEvent.click(screen.getByTestId('CONSTRAINT_VALUES_ADD_BUTTON'));

            const chip = await screen.findByTitle(
                'Target range: 10.0.0.0 - 10.255.255.255',
            );
            expect(chip).toHaveTextContent('10.0.0.0/8');
        });

        test('prevents selecting legal values that are invalid for the operator', async () => {
            setupApi({
                contextFields: [
                    {
                        name: 'ipAddress',
                        legalValues: [
                            { value: 'not-an-ip-10' },
                            { value: '10.0.0.0/8' },
                            { value: '192.168.1.1' },
                        ],
                    },
                ],
            });
            const onUpdate = vi.fn();

            render(
                <EditableConstraint
                    constraint={{
                        contextName: 'ipAddress',
                        operator: 'IN_CIDR',
                        values: [],
                    }}
                    onDelete={vi.fn()}
                    onUpdate={onUpdate}
                />,
            );

            expect(
                await screen.findByRole('checkbox', { name: 'not-an-ip-10' }),
            ).toBeDisabled();
            expect(
                screen.getByRole('checkbox', { name: '10.0.0.0/8' }),
            ).toBeEnabled();
            screen.getByText(
                'Values that are not valid for your chosen operator have been disabled.',
            );

            await userEvent.type(screen.getByLabelText('Search'), '10{Enter}');

            await waitFor(() => {
                expect(onUpdate.mock.lastCall?.[0]).toMatchObject({
                    operator: 'IN_CIDR',
                    values: ['10.0.0.0/8'],
                });
            });

            await userEvent.clear(screen.getByLabelText('Search'));
            fireEvent.click(screen.getByRole('button', { name: 'Select all' }));

            await waitFor(() => {
                expect(onUpdate.mock.lastCall?.[0]).toMatchObject({
                    operator: 'IN_CIDR',
                    values: ['10.0.0.0/8', '192.168.1.1'],
                });
            });
            screen.getByRole('button', { name: 'Unselect all' });
        });

        test('disables select all when no legal value is valid for the operator', async () => {
            setupApi({
                contextFields: [
                    {
                        name: 'ipAddress',
                        legalValues: [{ value: 'not-an-ip' }],
                    },
                ],
            });

            render(
                <EditableConstraint
                    constraint={{
                        contextName: 'ipAddress',
                        operator: 'IN_CIDR',
                        values: [],
                    }}
                    onDelete={vi.fn()}
                    onUpdate={vi.fn()}
                />,
            );

            expect(
                await screen.findByRole('button', { name: 'Select all' }),
            ).toBeDisabled();
        });
    });
});
