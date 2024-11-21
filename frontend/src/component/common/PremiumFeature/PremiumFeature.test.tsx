import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { PremiumFeature } from './PremiumFeature';

test('Show plans comparison message and link by default', async () => {
    render(<PremiumFeature feature='environments' tooltip={true} />);

    const link = screen.getByText('Compare plans');

    expect(link).toHaveAttribute(
        'href',
        'https://www.getunleash.io/plans?feature=environments',
    );
});

test('Show upgrade message and link', async () => {
    render(
        <PremiumFeature feature='environments' tooltip={true} mode='upgrade' />,
    );

    const link = screen.getByText('View our Enterprise offering');

    expect(link).toHaveAttribute(
        'href',
        'https://www.getunleash.io/upgrade_unleash?utm_source=environments',
    );
});
