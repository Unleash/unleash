import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { PremiumFeature } from './PremiumFeature.tsx';

test('Show plans comparison message and link by default - with tooltip', async () => {
    render(<PremiumFeature feature='environments' tooltip={true} />);

    const link = screen.getByText('Compare plans');

    expect(link).toHaveAttribute(
        'href',
        'https://www.getunleash.io/plans?feature=environments',
    );
});

test('Show plans comparison message and link by default - without tooltip', async () => {
    render(<PremiumFeature feature='environments' tooltip={false} />);

    const link = screen.getByText('Compare plans');

    expect(link).toHaveAttribute(
        'href',
        'https://www.getunleash.io/plans?feature=environments',
    );
});

test('Show upgrade message and link - with tooltip', async () => {
    render(
        <PremiumFeature feature='environments' tooltip={true} mode='upgrade' />,
    );

    const link = screen.getByText('View our Enterprise offering');

    expect(link).toHaveAttribute(
        'href',
        'https://www.getunleash.io/upgrade-unleash?utm_medium=feature&utm_content=environments',
    );
});

test('Show upgrade message and link - without tooltip', async () => {
    render(
        <PremiumFeature
            feature='environments'
            tooltip={false}
            mode='upgrade'
        />,
    );

    const link = screen.getByText('View our Enterprise offering');

    expect(link).toHaveAttribute(
        'href',
        'https://www.getunleash.io/upgrade-unleash?utm_medium=feature&utm_content=environments',
    );
});
