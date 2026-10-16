import type { Tracking } from 'utils/trackingEvents';

export const createApiTokenTracking: Tracking = {
    event: 'api-tokens',
    type: 'create-api-token',
};

const projectScope = (projects: string[] = []) => {
    if (projects.includes('*')) return 'all';
    if (projects.length === 0) return 'none';
    return projects.length === 1 ? 'single' : 'multiple';
};

export const apiTokenCreationProps = (newToken: {
    type: string;
    projects?: string[];
}) => ({
    tokenType: newToken.type.toLowerCase(),
    projectScope: projectScope(newToken.projects),
});

export const copyApiTokenTracking = (
    token: { type: string },
    method: 'confirm-dialog' | 'token-list',
): Tracking => ({
    event: 'api-tokens',
    type: 'copy-api-token',
    props: { tokenType: token.type.toLowerCase(), method },
});

export const deleteApiTokenTracking = (token: { type: string }): Tracking => ({
    event: 'api-tokens',
    type: 'delete-api-token',
    props: { tokenType: token.type.toLowerCase() },
});
