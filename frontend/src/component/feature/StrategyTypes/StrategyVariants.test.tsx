import { useState } from 'react';
import { expect, test } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import type { StrategyFormState } from 'interfaces/strategy';
import type { StrategyVariantSchema } from 'openapi';
import { StrategyVariants } from './StrategyVariants.tsx';
import {
    absorbWeightChange,
    weightsFromDraggedHandle,
} from './variantWeights.ts';

const server = testServerSetup();

const setupContextApi = () => {
    testServerRoute(server, '/api/admin/context', [{ name: 'appName' }]);
};

const variant = (
    name: string,
    weight: number,
    weightType: StrategyVariantSchema['weightType'] = 'variable',
): StrategyVariantSchema => ({
    name,
    weight,
    weightType,
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

test('adding a variant splits 100% as evenly as the percents allow, with the leftover going to the first variants', async () => {
    setupContextApi();
    render(<VariantsEditor />);

    fireEvent.click(screen.getByTestId('ADD_STRATEGY_VARIANT_BUTTON'));
    fireEvent.click(screen.getByTestId('ADD_STRATEGY_VARIANT_BUTTON'));
    fireEvent.click(screen.getByTestId('ADD_STRATEGY_VARIANT_BUTTON'));

    expect(pillLabels()).toEqual(['33.4%', '33.3%', '33.3%']);
});

test('dragging a handle rounds the dragged weight to a whole percent and trades only within the two variants it separates', async () => {
    setupContextApi();
    render(
        <VariantsEditor
            variants={[
                variant('a', 253),
                variant('b', 252),
                variant('c', 248),
                variant('d', 247),
            ]}
        />,
    );

    fireEvent.change(
        screen.getByRole('slider', { name: 'Split between a and b' }),
        { target: { value: '270' } },
    );

    expect(pillLabels()).toEqual(['a27%', 'b23.5%', 'c24.8%', 'd24.7%']);
    expect(await screen.findByLabelText('Weight')).toHaveValue(27);
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
    expect(
        absorbWeightChange({ weights: [340, 200, 330], changedIndex: 1 }),
    ).toEqual([340, 200, 460]);
    expect(
        absorbWeightChange({ weights: [950, 100, 100], changedIndex: 0 }),
    ).toEqual([950, 0, 50]);
    expect(
        absorbWeightChange({ weights: [330, 330, 500], changedIndex: 2 }),
    ).toEqual([330, 170, 500]);
});

test('a locked variant keeps its weight while others are added and retyped', async () => {
    setupContextApi();
    render(
        <VariantsEditor
            variants={[variant('a', 400, 'fix'), variant('b', 600)]}
        />,
    );

    expect(
        await screen.findByLabelText('Weight'),
        "the locked variant's own weight input",
    ).toBeDisabled();

    fireEvent.click(screen.getByTestId('ADD_STRATEGY_VARIANT_BUTTON'));
    expect(pillLabels()).toEqual(['a40%Locked weight', 'b30%', '30%']);

    fireEvent.click(screen.getByRole('tab', { name: /b/ }));
    fireEvent.change(await screen.findByLabelText('Weight'), {
        target: { value: '50' },
    });
    expect(pillLabels()).toEqual(['a40%Locked weight', 'b50%', '10%']);
});

test('a repeated drag event at the same position changes nothing, so a held pointer cannot drain other variants', () => {
    const evenEighths = [125, 125, 125, 125, 125, 125, 125, 125];
    const pointerAt510 = [125, 250, 375, 510, 625, 750, 875];

    const afterFirstDrag = weightsFromDraggedHandle({
        previousWeights: evenEighths,
        splitPositions: pointerAt510,
        draggedHandleIndex: 3,
    });
    expect(afterFirstDrag).toEqual([125, 125, 125, 140, 110, 125, 125, 125]);

    const afterRepeatedEvent = weightsFromDraggedHandle({
        previousWeights: afterFirstDrag,
        splitPositions: pointerAt510,
        draggedHandleIndex: 3,
    });
    expect(afterRepeatedEvent).toEqual(afterFirstDrag);
});

test('a drag stops when the shrinking neighbor runs out of weight instead of moving on to the next variant', async () => {
    setupContextApi();
    render(
        <VariantsEditor
            variants={[
                variant('a', 250),
                variant('b', 250),
                variant('c', 250),
                variant('d', 250),
            ]}
        />,
    );

    fireEvent.change(
        screen.getByRole('slider', { name: 'Split between a and b' }),
        { target: { value: '600' } },
    );

    expect(pillLabels()).toEqual(['a50%', 'b0%', 'c25%', 'd25%']);
});
