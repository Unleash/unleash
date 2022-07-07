import { formatUpdateStrategyApiCode } from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';

test('formatUpdateStrategyApiCode', () => {
    expect(
        formatUpdateStrategyApiCode(
            'projectId',
            'featureId',
            'environmentId',
            { id: 'strategyId' },
            'unleashUrl'
        )
    ).toMatchInlineSnapshot(`
      "curl --location --request PUT 'unleashUrl/api/admin/projects/projectId/features/featureId/environments/environmentId/strategies/strategyId' \\\\
          --header 'Authorization: INSERT_API_KEY' \\\\
          --header 'Content-Type: application/json' \\\\
          --data-raw '{
        \\"id\\": \\"strategyId\\"
      }'"
    `);
});
