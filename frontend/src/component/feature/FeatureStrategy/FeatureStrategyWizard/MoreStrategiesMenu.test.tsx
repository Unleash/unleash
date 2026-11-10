import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { render, settleProviders } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import type { IStrategy } from 'interfaces/strategy';
import { MoreStrategiesMenu } from './MoreStrategiesMenu.tsx';

const server = testServerSetup();

const MANUAL_STRATEGY = 'flexibleRollout';

const strategy = (
    overrides: Partial<IStrategy> & { name: string },
): IStrategy => ({
    displayName: '',
    description: '',
    editable: false,
    deprecated: false,
    parameters: [],
    ...overrides,
});

const STRATEGIES = [
    strategy({ name: MANUAL_STRATEGY, displayName: 'Gradual rollout' }),
    strategy({ name: 'default' }),
    strategy({ name: 'remoteAddress' }),
    strategy({ name: 'gradualRolloutRandom', deprecated: true }),
    strategy({ name: 'my-custom-strategy', editable: true }),
];

const setupApi = (strategies: IStrategy[] = STRATEGIES) => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { oss: '1.0.0' } },
    });
    testServerRoute(server, '/api/admin/strategies', { strategies });
};

const renderMenu = () => {
    const selections: string[] = [];

    render(
        <MoreStrategiesMenu
            onSelect={(strategy) => selections.push(strategy.name)}
        />,
    );

    return { selections };
};

const openMenu = async () => {
    fireEvent.click(
        await screen.findByRole('button', { name: /More strategies/ }),
    );

    return Array.from(screen.getByRole('menu').children).map(
        (entry) => entry.textContent,
    );
};

describe('the more strategies menu', () => {
    it('groups the advanced strategies apart from the custom ones', async () => {
        setupApi();
        renderMenu();

        expect(await openMenu()).toEqual([
            'Advanced strategies',
            'IPs',
            'Custom strategies',
            'my-custom-strategy',
        ]);
    });

    it('does not render when the setup cards already cover every strategy', async () => {
        setupApi([strategy({ name: MANUAL_STRATEGY })]);
        renderMenu();

        // Run 2 cycles to make sure nothing renders after:
        // 1. requests resolved
        await settleProviders();
        // 2. SWR re-render
        await settleProviders();

        expect(
            screen.queryByRole('button', { name: /More strategies/ }),
        ).not.toBeInTheDocument();
    });
});
