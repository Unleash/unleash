import type { LicensedUsersSchema } from 'openapi';
import {
    useApiGetter,
    fetcher,
} from './api/getters/useApiGetter/useApiGetter.js';
import { formatApiPath } from '../utils/formatPath.js';

const path = `api/admin/licensed-users`;

const placeholderData: LicensedUsersSchema = {
    seatCount: 0,
    licensedUsers: {
        current: 0,
        history: [],
    },
};

export const useLicensedUsers = () => {
    const { data, refetch, loading, error } = useApiGetter<LicensedUsersSchema>(
        formatApiPath(path),
        () => fetcher(formatApiPath(path), 'Seats used'),
    );

    return { data: data || placeholderData, refetch, loading, error };
};
