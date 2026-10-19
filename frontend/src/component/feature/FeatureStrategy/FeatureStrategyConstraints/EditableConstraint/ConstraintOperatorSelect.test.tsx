import { screen, fireEvent } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { describe, expect, test, vi } from 'vitest';
import { ConstraintOperatorSelect } from './ConstraintOperatorSelect';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', { flags: {} });
};

const openPopover = async () => {
    fireEvent.click(await screen.findByRole('button', { name: 'Operator' }));
};

describe('ConstraintOperatorSelect', () => {
    test('shows "matches" as pressed when not inverted', async () => {
        setupApi();

        render(
            <ConstraintOperatorSelect
                contextName='appName'
                options={['IN', 'NOT_IN']}
                value='IN'
                onChange={vi.fn()}
                inverted={false}
                onToggleInverted={vi.fn()}
            />,
        );

        await openPopover();

        expect(screen.getByRole('button', { name: 'matches' })).toHaveAttribute(
            'aria-pressed',
            'true',
        );
        expect(
            screen.getByRole('button', { name: 'does not match' }),
        ).toHaveAttribute('aria-pressed', 'false');
    });

    test('shows "does not match" as pressed when inverted', async () => {
        setupApi();

        render(
            <ConstraintOperatorSelect
                contextName='appName'
                options={['IN', 'NOT_IN']}
                value='IN'
                onChange={vi.fn()}
                inverted={true}
                onToggleInverted={vi.fn()}
            />,
        );

        await openPopover();

        expect(screen.getByRole('button', { name: 'matches' })).toHaveAttribute(
            'aria-pressed',
            'false',
        );
        expect(
            screen.getByRole('button', { name: 'does not match' }),
        ).toHaveAttribute('aria-pressed', 'true');
    });

    test('toggles inversion when clicking the other match button', async () => {
        setupApi();
        const onToggleInverted = vi.fn();

        render(
            <ConstraintOperatorSelect
                contextName='appName'
                options={['IN', 'NOT_IN']}
                value='IN'
                onChange={vi.fn()}
                inverted={false}
                onToggleInverted={onToggleInverted}
            />,
        );

        await openPopover();
        fireEvent.click(screen.getByRole('button', { name: 'does not match' }));

        expect(onToggleInverted).toHaveBeenCalledTimes(1);
    });

    test('disables the match toggle and shows the reason when inversion is unsupported', async () => {
        setupApi();

        render(
            <ConstraintOperatorSelect
                contextName='appName'
                options={['REGEX']}
                value='REGEX'
                onChange={vi.fn()}
                inverted={false}
                onToggleInverted={vi.fn()}
                invertedDisabledText='The REGEX operator does not support inversion'
            />,
        );

        await openPopover();

        const matchesButton = screen.getByRole('button', { name: 'matches' });
        expect(matchesButton).toBeDisabled();
        expect(
            screen.getByRole('button', { name: 'does not match' }),
        ).toBeDisabled();

        fireEvent.mouseOver(matchesButton.closest('span') ?? matchesButton);
        await screen.findByText(
            'The REGEX operator does not support inversion',
        );
    });
});
