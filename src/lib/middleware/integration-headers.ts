import type { Request } from 'express';

const ORIGIN = 'origin';
const httpMatcher = /^https?:\/\//;
const userAgentMatches = [
    { label: 'Axios', matcher: /^axios/ },
    { label: 'Curl', matcher: /^curl/ },
    { label: 'Go', matcher: /^Go-http-client/ },
    { label: 'Python', matcher: /^python-requests/ },
    { label: 'Node', matcher: /^node/ },
    { label: 'Java', matcher: /^Apache-HttpClient.*Java/ },
    { label: 'JiraCloudUnleash', matcher: /^Jira-Cloud-Unleash/ },
    { label: 'TerraformUnleash', matcher: /^Terraform-Provider-Unleash/ },
    { label: 'OpenAPIGO', matcher: /^OpenAPI-Generator\/.*\/go/ },
    { label: 'RestClientRuby', matcher: /^rest-client\/.*ruby/ },
];

export const getFilteredOrigin = (request: Request): string | undefined => {
    const origin = request.headers[ORIGIN];
    if (origin && httpMatcher.test(origin)) {
        return origin;
    }

    return undefined;
};

export const determineIntegrationSource = (
    userAgent: string,
): string | undefined => {
    return (
        userAgentMatches.find((candidate) => candidate.matcher.test(userAgent))
            ?.label ?? 'Other'
    );
};
