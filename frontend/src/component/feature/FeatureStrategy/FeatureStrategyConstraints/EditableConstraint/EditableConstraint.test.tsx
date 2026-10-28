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

        test('closes the editor and brings back the add value button when the value is deleted', async () => {
            setupApi();

            const constraint: IConstraint = {
                contextName: 'appName',
                operator: 'REGEX',
                value: '[invalid',
            };

            const { container } = render(
                <EditableConstraint
                    constraint={constraint}
                    onDelete={noOp}
                    onUpdate={noOp}
                />,
            );

            await screen.findByTestId('CONSTRAINT_VALUES_INPUT');

            const deleteIcon = container.querySelector('.MuiChip-deleteIcon');
            expect(deleteIcon).not.toBeNull();
            fireEvent.click(deleteIcon as Element);

            expect(
                screen.queryByTestId('CONSTRAINT_VALUES_INPUT'),
            ).not.toBeInTheDocument();
            await screen.findByRole('button', { name: 'Add value' });
        });
    });

    describe('REGEX constraint with an existing valid value', () => {
        test('shows the add value button after operator changes away from and back to REGEX, and opens the editor on click', async () => {
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
            fireEvent.click(screen.getByRole('button', { name: 'Operator' }));
            fireEvent.click(await screen.findByText(/is one of/i));

            // Change operator back to REGEX
            fireEvent.click(screen.getByRole('button', { name: 'Operator' }));
            fireEvent.click(await screen.findByText(/matches regex/i));

            const addValueButton = await screen.findByRole('button', {
                name: 'Add value',
            });
            expect(
                screen.queryByTestId('CONSTRAINT_VALUES_INPUT'),
            ).not.toBeInTheDocument();

            fireEvent.click(addValueButton);

            await screen.findByTestId('CONSTRAINT_VALUES_INPUT');
            expect(
                screen.queryByRole('button', { name: 'Add value' }),
            ).not.toBeInTheDocument();
        });
    });

    describe('inline value input', () => {
        test('keeps an unsubmitted draft after an accidental close, but clears it on submit or operator change', async () => {
            setupApi();

            render(
                <EditableConstraint
                    constraint={{
                        contextName: 'appName',
                        operator: 'IN',
                        values: [],
                    }}
                    onDelete={noOp}
                    onUpdate={noOp}
                />,
            );

            fireEvent.click(
                await screen.findByTestId('CONSTRAINT_ADD_VALUES_BUTTON'),
            );
            let input = await screen.findByLabelText('Constraint Value');
            await userEvent.type(input, 'draft-value');
            fireEvent.keyDown(input, { key: 'Escape' });
            expect(
                screen.queryByTestId('CONSTRAINT_VALUES_INPUT'),
            ).not.toBeInTheDocument();

            fireEvent.click(screen.getByTestId('CONSTRAINT_ADD_VALUES_BUTTON'));
            input = await screen.findByLabelText('Constraint Value');
            expect(input).toHaveValue('draft-value');

            fireEvent.click(screen.getByTestId('CONSTRAINT_VALUES_ADD_BUTTON'));
            await screen.findByText('draft-value');
            expect(input).toHaveValue('');

            await userEvent.type(input, 'leftover');
            fireEvent.keyDown(input, { key: 'Escape' });

            fireEvent.click(screen.getByRole('button', { name: 'Operator' }));
            fireEvent.click(await screen.findByText(/is not one of/i));

            fireEvent.click(screen.getByTestId('CONSTRAINT_ADD_VALUES_BUTTON'));
            input = await screen.findByLabelText('Constraint Value');
            expect(input).toHaveValue('');
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

            fireEvent.click(
                await screen.findByRole('button', { name: 'Operator' }),
            );
            fireEvent.click(await screen.findByText(/is an IP in/i));

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

            fireEvent.click(
                await screen.findByTestId('CONSTRAINT_ADD_VALUES_BUTTON'),
            );
            await waitFor(() => {
                expect(screen.queryAllByRole('option').length).toBeGreaterThan(
                    0,
                );
            });

            expect(
                screen.getByRole('option', { name: 'not-an-ip-10' }),
            ).toHaveAttribute('aria-disabled', 'true');
            expect(
                screen.getByRole('option', { name: '10.0.0.0/8' }),
            ).not.toHaveAttribute('aria-disabled', 'true');

            const callsBeforeDisabledClick = onUpdate.mock.calls.length;
            fireEvent.click(
                screen.getByRole('option', { name: 'not-an-ip-10' }),
            );
            expect(onUpdate.mock.calls.length).toBe(callsBeforeDisabledClick);

            fireEvent.click(screen.getByRole('option', { name: '10.0.0.0/8' }));

            await waitFor(() => {
                expect(onUpdate.mock.lastCall?.[0]).toMatchObject({
                    operator: 'IN_CIDR',
                    values: ['10.0.0.0/8'],
                });
            });

            fireEvent.click(
                screen.getByRole('option', { name: '192.168.1.1' }),
            );

            await waitFor(() => {
                expect(onUpdate.mock.lastCall?.[0]).toMatchObject({
                    operator: 'IN_CIDR',
                    values: ['10.0.0.0/8', '192.168.1.1'],
                });
            });
        });

        test('shows legal values as disabled when none are valid for the operator', async () => {
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

            fireEvent.click(
                await screen.findByTestId('CONSTRAINT_ADD_VALUES_BUTTON'),
            );
            await waitFor(() => {
                expect(screen.queryAllByRole('option').length).toBeGreaterThan(
                    0,
                );
            });

            expect(
                screen.getByRole('option', { name: 'not-an-ip' }),
            ).toHaveAttribute('aria-disabled', 'true');
        });

        test('adds multiple legal values pasted as a comma-separated list, rejects values not in the legal set, and closes once exhausted', async () => {
            setupApi({
                contextFields: [
                    {
                        name: 'ipAddress',
                        legalValues: [
                            { value: '10.0.0.0/8' },
                            { value: '192.168.1.1' },
                            { value: '172.16.0.0/12' },
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

            fireEvent.click(
                await screen.findByTestId('CONSTRAINT_ADD_VALUES_BUTTON'),
            );
            const input = await screen.findByLabelText('Constraint Value');
            await waitFor(() => {
                expect(screen.queryAllByRole('option').length).toBeGreaterThan(
                    0,
                );
            });

            await userEvent.type(input, '10.0.0.0/8,192.168.1.1');
            fireEvent.keyDown(input, { key: 'Enter' });

            await waitFor(() => {
                expect(onUpdate.mock.lastCall?.[0]).toMatchObject({
                    operator: 'IN_CIDR',
                    values: ['10.0.0.0/8', '192.168.1.1'],
                });
            });

            await userEvent.type(input, '8.8.8.8');
            fireEvent.keyDown(input, { key: 'Enter' });

            expect(
                await screen.findByText(
                    '"8.8.8.8" is not a legal value for this field.',
                ),
            ).toBeInTheDocument();

            // Picking the last remaining legal value (172.16.0.0/12) exhausts
            // the list: the editor closes and the add-value button is gone.
            await userEvent.clear(input);
            fireEvent.click(
                screen.getByRole('option', { name: '172.16.0.0/12' }),
            );

            await waitFor(() => {
                expect(onUpdate.mock.lastCall?.[0]).toMatchObject({
                    operator: 'IN_CIDR',
                    values: ['10.0.0.0/8', '192.168.1.1', '172.16.0.0/12'],
                });
            });

            expect(input).not.toBeInTheDocument();
            expect(
                screen.queryByTestId('CONSTRAINT_ADD_VALUES_BUTTON'),
            ).not.toBeInTheDocument();
        });

        test('typing a prefix and pressing Enter toggles the auto-highlighted match without raising a stale "not a legal value" error', async () => {
            setupApi({
                contextFields: [
                    {
                        name: 'ipAddress',
                        legalValues: [
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

            fireEvent.click(
                await screen.findByTestId('CONSTRAINT_ADD_VALUES_BUTTON'),
            );
            const input = await screen.findByLabelText('Constraint Value');
            await waitFor(() => {
                expect(screen.queryAllByRole('option').length).toBeGreaterThan(
                    0,
                );
            });

            await userEvent.type(input, '10.');
            fireEvent.keyDown(input, { key: 'Enter' });

            await waitFor(() => {
                expect(onUpdate.mock.lastCall?.[0]).toMatchObject({
                    operator: 'IN_CIDR',
                    values: ['10.0.0.0/8'],
                });
            });

            expect(input).toHaveValue('');
            expect(
                screen.queryByText(/is not a legal value/),
            ).not.toBeInTheDocument();
        });

        test('arrow keys visibly move the highlight between legal value options', async () => {
            setupApi({
                contextFields: [
                    {
                        name: 'ipAddress',
                        legalValues: [
                            { value: '10.0.0.0/8' },
                            { value: '192.168.1.1' },
                        ],
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

            fireEvent.click(
                await screen.findByTestId('CONSTRAINT_ADD_VALUES_BUTTON'),
            );
            const input = await screen.findByLabelText('Constraint Value');
            await waitFor(() => {
                expect(screen.queryAllByRole('option').length).toBeGreaterThan(
                    0,
                );
            });

            fireEvent.keyDown(input, { key: 'ArrowDown' });

            await waitFor(() => {
                const option = screen.getByRole('option', {
                    name: '192.168.1.1',
                });
                expect(option).toHaveClass('Mui-focused');
                expect(getComputedStyle(option).backgroundColor).not.toBe('');
                expect(getComputedStyle(option).backgroundColor).not.toBe(
                    'rgba(0, 0, 0, 0)',
                );
            });
        });
    });
});
