import useSWR, { type SWRConfiguration } from 'swr';
import { differenceInDays, parseISO } from 'date-fns';
import { formatApiPath } from 'utils/formatPath';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import type { EventSearchResponseSchema } from 'openapi';

const MIN_TENURE_DAYS = 1;
const MAX_TENURE_DAYS = 14;
const ESTABLISHED_ACTIVITY_THRESHOLD = 2;
const SWR_OPTIONS: SWRConfiguration = {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    dedupingInterval: 60 * 60 * 1000,
};

const ACTIVITY_EVENT_TYPES = [
    'feature-created',
    'strategy-created',
    'strategy-updated',
    'feature-environment-enabled',
    'feature-environment-disabled',
].join(',');

const tenureDays = (createdAt?: string): number | undefined => {
    if (!createdAt) {
        return undefined;
    }
    const parsed = parseISO(createdAt);
    if (Number.isNaN(parsed.getTime())) {
        return undefined;
    }
    return differenceInDays(Date.now(), parsed);
};

const buildActivityKey = (userId: number): string => {
    const params = new URLSearchParams({
        createdBy: `IS:${userId}`,
        type: `IS_ANY_OF:${ACTIVITY_EVENT_TYPES}`,
        limit: String(ESTABLISHED_ACTIVITY_THRESHOLD),
        offset: '0',
    });
    return `api/admin/search/events?${params.toString()}`;
};

const fetchActivityCount = (key: string): Promise<EventSearchResponseSchema> =>
    fetch(formatApiPath(key)).then((res) => {
        if (!res.ok) throw new Error(`Activity check failed: ${res.status}`);
        return res.json();
    });

export const useIsNewUser = (): boolean => {
    const { user } = useAuthUser();
    const tenure = tenureDays(user?.createdAt);

    const inActivityCheckWindow =
        tenure !== undefined &&
        tenure >= MIN_TENURE_DAYS &&
        tenure < MAX_TENURE_DAYS;

    const swrKey =
        inActivityCheckWindow && user?.id ? buildActivityKey(user.id) : null;

    const { data, isLoading } = useSWR<EventSearchResponseSchema>(
        swrKey,
        fetchActivityCount,
        SWR_OPTIONS,
    );

    if (tenure === undefined || tenure >= MAX_TENURE_DAYS) {
        return false;
    }

    if (tenure < MIN_TENURE_DAYS) {
        return true;
    }

    if (isLoading || !data) {
        return true;
    }

    return data.total < ESTABLISHED_ACTIVITY_THRESHOLD;
};
