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
    test('checks "matches" when not inverted', async () => {
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

        expect(screen.getByRole('radio', { name: 'matches' })).toBeChecked();
        expect(
            screen.getByRole('radio', { name: 'does not match' }),
        ).not.toBeChecked();
    });

    test('checks "does not match" when inverted', async () => {
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

        expect(
            screen.getByRole('radio', { name: 'matches' }),
        ).not.toBeChecked();
        expect(
            screen.getByRole('radio', { name: 'does not match' }),
        ).toBeChecked();
    });

    test.each([
        { inverted: false, option: 'does not match' },
        { inverted: true, option: 'matches' },
    ])('toggles inversion when clicking $option', async ({
        inverted,
        option,
    }) => {
        setupApi();
        const onToggleInverted = vi.fn();

        render(
            <ConstraintOperatorSelect
                contextName='appName'
                options={['IN', 'NOT_IN']}
                value='IN'
                onChange={vi.fn()}
                inverted={inverted}
                onToggleInverted={onToggleInverted}
            />,
        );

        await openPopover();
        fireEvent.click(screen.getByRole('radio', { name: option }));

        expect(onToggleInverted).toHaveBeenCalledTimes(1);
    });

    test('disables the match options and shows the reason when inversion is unsupported', async () => {
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

        expect(screen.getByRole('radio', { name: 'matches' })).toBeDisabled();
        expect(
            screen.getByRole('radio', { name: 'does not match' }),
        ).toBeDisabled();

        fireEvent.mouseOver(
            screen.getByRole('radiogroup', { name: 'Match type' }),
        );
        await screen.findByText(
            'The REGEX operator does not support inversion',
        );
    });

    test('toggles the case sensitivity row inert when the operator does not support it', async () => {
        setupApi();

        render(
            <ConstraintOperatorSelect
                contextName='appName'
                options={['IN', 'NOT_IN']}
                value='IN'
                onChange={vi.fn()}
                inverted={false}
                onToggleInverted={vi.fn()}
                showCaseSensitiveButton={false}
            />,
        );

        await openPopover();

        const label = screen.getByText('Case sensitive');
        expect(label.closest('[inert]')).not.toBeNull();
    });

    test('renders the case sensitivity row as interactive when the operator supports it', async () => {
        setupApi();
        const onToggleCaseSensitivity = vi.fn();

        render(
            <ConstraintOperatorSelect
                contextName='appName'
                options={['IN', 'NOT_IN']}
                value='IN'
                onChange={vi.fn()}
                inverted={false}
                onToggleInverted={vi.fn()}
                showCaseSensitiveButton={true}
                caseInsensitive={false}
                onToggleCaseSensitivity={onToggleCaseSensitivity}
            />,
        );

        await openPopover();

        const label = screen.getByText('Case sensitive');
        expect(label.closest('[inert]')).toBeNull();

        fireEvent.click(screen.getByRole('switch'));
        expect(onToggleCaseSensitivity).toHaveBeenCalledTimes(1);
    });
});
