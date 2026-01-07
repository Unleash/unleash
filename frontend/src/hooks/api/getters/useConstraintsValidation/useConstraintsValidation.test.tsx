import { render, screen } from '@testing-library/react';
import type { IConstraint } from 'interfaces/strategy'; // Assuming you have your component in this path
import type { FC } from 'react';
import { useConstraintsValidation } from './useConstraintsValidation.ts';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

const TestComponent: FC<{ constraints: IConstraint[] }> = ({ constraints }) => {
    const valid = useConstraintsValidation(constraints);

    return <div>{valid ? 'Valid' : 'Invalid'}</div>;
};

test('should display Valid when constraints are valid', async () => {
    testServerRoute(
        server,
        '/api/admin/constraints/validate',
        { data: 'OK' },
        'post',
    );

    const validConstraints: IConstraint[] = [
        {
            value: 'test',
            values: ['test'],
            operator: 'IN',
            contextName: 'irrelevant',
        },
        {
            value: 'test',
            values: ['test'],
            operator: 'IN',
            contextName: 'irrelevant',
        },
    ];

    render(<TestComponent constraints={validConstraints} />);

    await screen.findByText('Valid');
});

test('should display Invalid when constraints are invalid', async () => {
    const emptyValueAndValues: IConstraint[] = [
        { value: '', values: [], operator: 'IN', contextName: 'irrelevant' },
        {
            value: '',
            values: [],
            operator: 'IN',
            contextName: 'irrelevant',
        },
    ];

    render(<TestComponent constraints={emptyValueAndValues} />);

    await screen.findByText('Invalid');
});
