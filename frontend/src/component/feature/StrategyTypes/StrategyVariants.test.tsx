import { useState } from 'react';
import { expect, test } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import type { StrategyFormState } from 'interfaces/strategy';
import type { StrategyVariantSchema } from 'openapi';
import { StrategyVariants } from './StrategyVariants.tsx';

const server = testServerSetup();

const setupContextApi = () => {
    testServerRoute(server, '/api/admin/context', [{ name: 'appName' }]);
};

const variant = (name: string, weight: number): StrategyVariantSchema => ({
    name,
    weight,
    weightType: 'variable',
    stickiness: 'default',
});

const VariantsEditor = ({
    variants = [],
}: {
    variants?: StrategyVariantSchema[];
}) => {
    const [strategy, setStrategy] = useState<StrategyFormState>({
        name: 'flexibleRollout',
        variants,
    });

    return (
        <StrategyVariants
            strategy={strategy}
            setStrategy={setStrategy}
            canRenamePreexistingVariants
        />
    );
};

const pillLabels = () =>
    screen.getAllByRole('tab').map((pill) => pill.textContent);

test('adding a variant splits 100% as evenly as whole percents allow, with the leftover percent going to the first variants', async () => {
    setupContextApi();
    render(<VariantsEditor />);

    fireEvent.click(screen.getByTestId('ADD_STRATEGY_VARIANT_BUTTON'));
    fireEvent.click(screen.getByTestId('ADD_STRATEGY_VARIANT_BUTTON'));
    fireEvent.click(screen.getByTestId('ADD_STRATEGY_VARIANT_BUTTON'));

    expect(pillLabels()).toEqual(['34%', '33%', '33%']);
});

test("moving the handle trades weight between the handle's two neighbours", async () => {
    setupContextApi();
    render(
        <VariantsEditor
            variants={[variant('a', 340), variant('b', 330), variant('c', 330)]}
        />,
    );

    fireEvent.change(
        screen.getByRole('slider', { name: 'Split between a and b' }),
        { target: { value: '350' } },
    );

    expect(pillLabels()).toEqual(['a35%', 'b32%', 'c33%']);
});
