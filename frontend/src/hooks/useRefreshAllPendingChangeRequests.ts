import { mutate } from 'swr';

export const useRefreshAllPendingChangeRequests = (
    projectId: string,
    features: string[],
) => {
    const refreshAll = () =>
        mutate(
            (key) => {
                if (typeof key !== 'string') return false;
                return features.some((feature) =>
                    key.includes(
                        `projects/${projectId}/change-requests/pending/${feature}`,
                    ),
                );
            },
            undefined,
            { revalidate: true },
        );
    return { refreshAll };
};
