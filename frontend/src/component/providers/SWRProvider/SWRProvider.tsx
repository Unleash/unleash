import { SWRConfig, unstable_serialize, useSWRConfig } from 'swr';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { ResponseError } from 'utils/apiUtils';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';

export const SWRProvider: React.FC<{ children?: React.ReactNode }> = ({
    children,
}) => {
    const { user, loading, refetchUser } = useAuthUser();
    const isLoggedIn = Boolean(user?.id);
    const { cache, mutate } = useSWRConfig();
    const wasLoggedOut = useRef(false);

    useEffect(() => {
        if (loading) return;
        if (!isLoggedIn) {
            wasLoggedOut.current = true;
            return;
        }
        if (!wasLoggedOut.current) return;
        wasLoggedOut.current = false;
        // Requests that failed while logged out keep their error in the cache,
        // so pages mounting after sign-in would show it until they refetch.
        // Passing `undefined` drops it now instead of only revalidating.
        mutate(
            (key) => Boolean(cache.get(unstable_serialize(key))?.error),
            undefined,
        );
    }, [loading, isLoggedIn, cache, mutate]);

    const onError = (error: Error) => {
        if (error instanceof ResponseError && error.status === 401) {
            // Refetch the user's data if they appear to be logged out.
            // This may trigger a login page redirect in ProtectedRoute.
            refetchUser();
        }
    };

    return <SWRConfig value={{ onError }}>{children}</SWRConfig>;
};
