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
    weightsAfterHandleDrag,
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

const fixedWeightsOnBar = () => {
    const handleValueTexts = screen
        .queryAllByRole('slider')
        .map((handle) => handle.getAttribute('aria-valuetext') ?? '');
    const variantValueTexts = handleValueTexts.flatMap((valueText, index) => {
        const [left, right] = valueText.split(', ');
        return index === 0 ? [left, right] : [right];
    });
    return variantValueTexts.flatMap((valueText) => {
        const fixedWeight = valueText.match(/: (\S+%) \(fixed\)$/);
        return fixedWeight ? [fixedWeight[1]] : [];
    });
};

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

    const handle = screen.getByRole('slider', {
        name: 'Split between a and b',
    });
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    fireEvent.keyDown(handle, { key: 'ArrowRight' });

    expect(pillLabels()).toEqual(['a27%', 'b23.5%', 'c24.8%', 'd24.7%']);
    expect(fixedWeightsOnBar()).toEqual(['27%', '23.5%']);
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
    expect(fixedWeightsOnBar()).toEqual(['50%']);
});

test('a typed weight is capped at what the fixed weights of the other variants leave', async () => {
    setupContextApi();
    render(
        <VariantsEditor
            variants={[
                variant('a', 400, 'fix'),
                variant('b', 300),
                variant('c', 300),
            ]}
        />,
    );

    fireEvent.click(screen.getByRole('tab', { name: /b/ }));
    fireEvent.change(await screen.findByLabelText('Weight'), {
        target: { value: '90' },
    });

    expect(screen.getByLabelText('Weight')).toHaveValue(60);
    expect(pillLabels()).toEqual(['a40%', 'b60%', 'c0%']);
    expect(fixedWeightsOnBar()).toEqual(['40%', '60%']);
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

test('a fixed-weight variant keeps its weight while others are added and retyped', async () => {
    setupContextApi();
    render(
        <VariantsEditor
            variants={[variant('a', 400, 'fix'), variant('b', 600)]}
        />,
    );

    expect(
        await screen.findByLabelText('Weight'),
        "the fixed variant's weight input stays editable",
    ).toBeEnabled();

    fireEvent.click(screen.getByTestId('ADD_STRATEGY_VARIANT_BUTTON'));
    expect(pillLabels()).toEqual(['a40%', 'b30%', '30%']);
    expect(fixedWeightsOnBar()).toEqual(['40%']);

    fireEvent.click(screen.getByRole('tab', { name: /b/ }));
    fireEvent.change(await screen.findByLabelText('Weight'), {
        target: { value: '50' },
    });
    expect(pillLabels()).toEqual(['a40%', 'b50%', '10%']);
    expect(fixedWeightsOnBar()).toEqual(['40%', '50%']);
});

test('a repeated drag event at the same position changes nothing, so a held pointer cannot drain other variants', () => {
    const evenEighths = [125, 125, 125, 125, 125, 125, 125, 125];

    const afterFirstDrag = weightsAfterHandleDrag({
        previousWeights: evenEighths,
        targetPosition: 510,
        draggedHandleIndex: 3,
    });
    expect(afterFirstDrag).toEqual([125, 125, 125, 140, 110, 125, 125, 125]);

    const afterRepeatedEvent = weightsAfterHandleDrag({
        previousWeights: afterFirstDrag,
        targetPosition: 510,
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

    const handle = screen.getByRole('slider', {
        name: 'Split between a and b',
    });
    fireEvent.keyDown(handle, { key: 'End' });

    expect(pillLabels()).toEqual(['a50%', 'b0%', 'c25%', 'd25%']);
    expect(fixedWeightsOnBar()).toEqual(['50%', '0%']);

    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(pillLabels()).toEqual(['a50%', 'b0%', 'c25%', 'd25%']);
});

test('dragging fixes the weights of the two variants it separates, always leaving at least one variable variant', async () => {
    setupContextApi();
    render(
        <VariantsEditor variants={[variant('a', 500), variant('b', 500)]} />,
    );

    fireEvent.keyDown(
        screen.getByRole('slider', { name: 'Split between a and b' }),
        { key: 'ArrowRight' },
    );

    expect(pillLabels()).toEqual(['a51%', 'b49%']);
    expect(fixedWeightsOnBar()).toEqual(['51%']);
});

test('with the last variant already fixed, only the left side of the pair gets fixed', async () => {
    setupContextApi();
    render(
        <VariantsEditor
            variants={[
                variant('a', 300),
                variant('b', 350),
                variant('c', 350, 'fix'),
            ]}
        />,
    );

    fireEvent.keyDown(
        screen.getByRole('slider', { name: 'Split between a and b' }),
        { key: 'ArrowRight' },
    );

    expect(pillLabels()).toEqual(['a31%', 'b34%', 'c35%']);
    expect(fixedWeightsOnBar()).toEqual(['31%', '35%']);
});
