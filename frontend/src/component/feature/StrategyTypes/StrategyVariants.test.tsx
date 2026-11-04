import { useState } from 'react';
import { expect, test } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import type { StrategyFormState } from 'interfaces/strategy';
import type { StrategyVariantSchema } from 'openapi';
import { StrategyVariants } from './StrategyVariants.tsx';
import { absorbWeightChange } from './variantWeights.ts';

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
    expect(await screen.findByLabelText('Weight')).toHaveValue(35);
});

test('a weight typed in the variant form flows to the pills, the neighbour absorbing the change first', async () => {
    setupContextApi();
    render(
        <VariantsEditor
            variants={[variant('a', 340), variant('b', 330), variant('c', 330)]}
        />,
    );

    fireEvent.change(await screen.findByLabelText('Weight'), {
        target: { value: '50' },
    });

    expect(pillLabels()).toEqual(['a50%', 'b17%', 'c33%']);
});

test('a changed weight trades with its following neighbours first, draining each before the next, and trades leftward only from the last variant', () => {
    expect(absorbWeightChange([340, 200, 330], 1)).toEqual([340, 200, 460]);
    expect(absorbWeightChange([950, 100, 100], 0)).toEqual([950, 0, 50]);
    expect(absorbWeightChange([330, 330, 500], 2)).toEqual([330, 170, 500]);
});
