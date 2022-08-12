import { formatUpdateStrategyApiCode } from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { IFeatureStrategy, IStrategy } from 'interfaces/strategy';

test('formatUpdateStrategyApiCode', () => {
    const strategy: IFeatureStrategy = {
        id: 'a',
        name: 'b',
        parameters: {
            c: 1,
            b: 2,
            a: 3,
        },
        constraints: [],
    };

    const strategyDefinition: IStrategy = {
        name: 'c',
        displayName: 'd',
        description: 'e',
        editable: false,
        deprecated: false,
        parameters: [
            { name: 'a', description: '', type: '', required: false },
            { name: 'b', description: '', type: '', required: false },
            { name: 'c', description: '', type: '', required: false },
        ],
    };

    expect(
        formatUpdateStrategyApiCode(
            'projectId',
            'featureId',
            'environmentId',
            strategy,
            strategyDefinition,
            'unleashUrl'
        )
    ).toMatchInlineSnapshot(`
      "curl --location --request PUT 'unleashUrl/api/admin/projects/projectId/features/featureId/environments/environmentId/strategies/a' \\\\
          --header 'Authorization: INSERT_API_KEY' \\\\
          --header 'Content-Type: application/json' \\\\
          --data-raw '{
        \\"id\\": \\"a\\",
        \\"name\\": \\"b\\",
        \\"parameters\\": {
          \\"a\\": 3,
          \\"b\\": 2,
          \\"c\\": 1
        },
        \\"constraints\\": []
      }'"
    `);
});
