import { expect, test, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import type { IntroVariant } from './introModel.ts';
import { IntroVariantsBar } from './IntroVariantsBar.tsx';

const variants = (weights: number[]): IntroVariant[] =>
    weights.map((weight, index) => ({
        name: String.fromCharCode(65 + index),
        weight,
        color: ['#6C65E5', '#D76500', '#68A611', '#DF416E'][index],
        label: `Experience ${index + 1}`,
        placeholder: `Search ${index + 1}`,
    }));

test('recovers collapsed variants from overlapping handles at the right edge', () => {
    const onWeightsChange = vi.fn();
    render(
        <IntroVariantsBar
            variants={variants([50, 50, 0, 0])}
            onWeightsChange={onWeightsChange}
        />,
    );

    const handles = screen.getAllByRole('separator');
    fireEvent.keyDown(handles[2], { key: 'ArrowLeft' });

    expect(onWeightsChange).toHaveBeenCalledWith([50, 49, 1, 0]);
});

test('recovers collapsed variants from overlapping handles at the left edge', () => {
    const onWeightsChange = vi.fn();
    render(
        <IntroVariantsBar
            variants={variants([0, 0, 50, 50])}
            onWeightsChange={onWeightsChange}
        />,
    );

    const handles = screen.getAllByRole('separator');
    fireEvent.keyDown(handles[0], { key: 'ArrowRight' });

    expect(onWeightsChange).toHaveBeenCalledWith([0, 1, 49, 50]);
});
