import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { Limit } from './Limit.tsx';

test('Render approaching limit variant', () => {
    render(
        <Limit
            name='strategies in this environment'
            shortName='strategies'
            limit={10}
            currentValue={8}
        />,
    );

    screen.getByText(
        'You are nearing the limit for strategies in this environment',
    );
    screen.getByText('80%');
    screen.getByText('Limit: 10');
});

test('Render reached limit variant', () => {
    render(
        <Limit
            name='strategies in this environment'
            shortName='strategies'
            limit={10}
            currentValue={10}
        />,
    );

    screen.getByText(
        'You have reached the limit for strategies in this environment',
    );
    screen.getByText('100%');
    screen.getByText('Limit: 10');
});

test('Render exceeded limit variant', () => {
    render(
        <Limit
            name='strategies in this environment'
            shortName='strategies'
            limit={10}
            currentValue={20}
        />,
    );

    screen.getByText(
        'You have reached the limit for strategies in this environment',
    );
    screen.getByText('200%');
    screen.getByText('Limit: 10');
});

test('Do not render any limit below threshold', () => {
    render(
        <Limit
            name='strategies in this environment'
            shortName='strategies'
            limit={10}
            currentValue={7}
        />,
    );

    expect(screen.queryByText('Limit: 10')).not.toBeInTheDocument();
});
