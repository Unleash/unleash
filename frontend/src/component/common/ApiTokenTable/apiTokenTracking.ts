import type { Tracking } from 'utils/trackingEvents';

export const apiTokenCreatedTracking: Tracking = {
    event: 'api-tokens',
    type: 'api-token-created',
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

export const apiTokenCopiedTracking = (
    token: { type: string },
    method: 'confirm-dialog' | 'token-list',
): Tracking => ({
    event: 'api-tokens',
    type: 'api-token-copied',
    props: { tokenType: token.type.toLowerCase(), method },
});

export const apiTokenDeletedTracking = (token: { type: string }): Tracking => ({
    event: 'api-tokens',
    type: 'api-token-deleted',
    props: { tokenType: token.type.toLowerCase() },
});
