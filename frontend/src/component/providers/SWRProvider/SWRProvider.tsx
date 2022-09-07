import { SWRConfig } from 'swr';
import React from 'react';
import { ResponseError } from 'utils/apiUtils';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';

export const SWRProvider: React.FC = ({ children }) => {
    const { refetchUser } = useAuthUser();

    const onError = (error: Error) => {
        if (error instanceof ResponseError && error.status === 401) {
            // Refetch the user's data if they appear to be logged out.
            // This may trigger a login page redirect in ProtectedRoute.
            refetchUser();
        }
    };

    return <SWRConfig value={{ onError }}>{children}</SWRConfig>;
};
