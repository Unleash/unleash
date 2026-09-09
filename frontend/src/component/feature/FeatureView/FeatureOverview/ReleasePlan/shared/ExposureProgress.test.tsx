import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { ExposureProgress } from './ExposureProgress.tsx';

const pillText = () => screen.getByText(/exposures/).textContent;

test('shows zero exposures without approximation symbol', () => {
    render(<ExposureProgress exposures={0} target={10000} />);

    expect(pillText()).toBe('0/10K exposures');
});

test('approximates exposures by rounding down to two significant digits', () => {
    render(<ExposureProgress exposures={987} target={1000} />);

    expect(pillText()).toBe('~980/1K exposures');
});

test('abbreviates exposure counts of a thousand or more', () => {
    render(<ExposureProgress exposures={12345} target={100000} />);

    expect(pillText()).toBe('~12K/100K exposures');
});

test('keeps one decimal when abbreviating exposure counts in the millions', () => {
    render(<ExposureProgress exposures={1234567} target={2000000} />);

    expect(pillText()).toBe('~1.2M/2M exposures');
});
