import { formatAddStrategyApiCode } from 'component/feature/FeatureStrategy/FeatureStrategyCreate/FeatureStrategyCreate';

test('formatAddStrategyApiCode', () => {
    expect(
        formatAddStrategyApiCode(
            'projectId',
            'featureId',
            'environmentId',
            { id: 'strategyId' },
            'unleashUrl'
        )
    ).toMatchInlineSnapshot(`
      "curl --location --request POST 'unleashUrl/api/admin/projects/projectId/features/featureId/environments/environmentId/strategies' \\\\
          --header 'Authorization: INSERT_API_KEY' \\\\
          --header 'Content-Type: application/json' \\\\
          --data-raw '{
        \\"id\\": \\"strategyId\\"
      }'"
    `);
});
