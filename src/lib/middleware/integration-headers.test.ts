import { determineIntegrationSource } from './integration-headers.js';

test('resolves known user agents to source labels', () => {
    expect(determineIntegrationSource('axios/0.27.2')).toBe('Axios');
    expect(determineIntegrationSource('axios/1.4.0')).toBe('Axios');
    expect(determineIntegrationSource('curl/8.6.0')).toBe('Curl');
    expect(determineIntegrationSource('node-fetch/1.0.0')).toBe('Node');
    expect(determineIntegrationSource('node')).toBe('Node');
    expect(determineIntegrationSource('python-requests/2.31.0')).toBe('Python');
    expect(determineIntegrationSource('Terraform-Provider-Unleash/1.1.1')).toBe(
        'TerraformUnleash',
    );
    expect(determineIntegrationSource('Jira-Cloud-Unleash')).toBe(
        'JiraCloudUnleash',
    );
    expect(determineIntegrationSource('OpenAPI-Generator/1.0.0/go')).toBe(
        'OpenAPIGO',
    );
    expect(
        determineIntegrationSource('Apache-HttpClient/4.5.13 (Java/11.0.22)'),
    ).toBe('Java');
    expect(determineIntegrationSource('Go-http-client/1.1')).toBe('Go');
    expect(
        determineIntegrationSource(
            'rest-client/2.0.2 (linux-gnu x86_64) ruby/2.1.7p400',
        ),
    ).toBe('RestClientRuby');
    expect(determineIntegrationSource('No-http-client')).toBe('Other');
});
