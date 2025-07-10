import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { FeatureStrategyConstraintAccordionList } from './FeatureStrategyConstraintAccordionList.tsx';
import type { IConstraint } from 'interfaces/strategy';
import { constraintId } from 'constants/constraintId.ts';

const server = testServerSetup();

const LIMIT = 5;

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        resourceLimits: {
            constraints: LIMIT,
        },
    });
    testServerRoute(server, '/api/admin/context', [{ name: 'text' }]);
};

const constraints = (limit: number): IConstraint[] =>
    // @ts-expect-error: we access the id field using `Symbol(id)`,
    // so just calling the property `id` doesn't work. Instead, we
    // need to use the `constraintId` symbol.
    Array.from(Array(limit).keys()).map((_, index) => ({
        [constraintId]: index,
        contextName: 'test',
        operator: 'IN',
    }));

test('show limit reached and disable adding new constraints', async () => {
    setupApi();
    render(
        <FeatureStrategyConstraintAccordionList
            constraints={constraints(LIMIT)}
            showCreateButton={true}
            setConstraints={() => {}}
        />,
    );

    await screen.findByText(
        'You have reached the limit for constraints in this strategy',
    );
    const button = await screen.findByText('Add constraint');
    expect(button).toBeDisabled();
});

test('show nearing limit', async () => {
    setupApi();
    render(
        <FeatureStrategyConstraintAccordionList
            constraints={constraints(LIMIT - 1)}
            showCreateButton={true}
            setConstraints={() => {}}
        />,
    );

    await screen.findByText(
        'You are nearing the limit for constraints in this strategy',
    );
    const button = await screen.findByText('Add constraint');
    expect(button).toBeEnabled();
});
