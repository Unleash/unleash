import { mutate } from 'swr';

export const refreshFeatureChangeRequests = (
    projectId: string,
    feature: string,
) => {
    return mutate(
        (key) => {
            if (typeof key !== 'string') return false;
            return key.includes(
                `projects/${projectId}/change-requests/pending/${feature}`,
            );
        },
        undefined,
        { revalidate: true },
    );
};
